import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { createDataRepository } from './dataRepository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 确保数据目录存在
const dataDir = join(__dirname, 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// 初始化数据库
const db = new Database(join(dataDir, 'brsms.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    home_team_id TEXT NOT NULL,
    guest_team_id TEXT NOT NULL,
    home_score INTEGER DEFAULT 0,
    guest_score INTEGER DEFAULT 0,
    quarter INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending'
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    match_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    team TEXT,
    value INTEGER,
    quarter INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS manual_matches (
    id TEXT PRIMARY KEY,
    sport_type TEXT DEFAULT '篮球',
    tournament_type TEXT NOT NULL,
    match_date TEXT,
    venue TEXT,
    home_team_id TEXT NOT NULL,
    away_team_id TEXT NOT NULL,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    winner_team_id TEXT,
    status TEXT DEFAULT '已结束',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS manual_match_statistics (
    id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    team_id TEXT NOT NULL,
    points INTEGER DEFAULT 0,
    rebounds INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS manual_players (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    team_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  INSERT OR IGNORE INTO teams (id, name) VALUES ('team-home', '主队');
  INSERT OR IGNORE INTO teams (id, name) VALUES ('team-guest', '客队');
`);

const repository = createDataRepository({ dataDir, liveDb: db });

// Express 应用
const app = express();
app.use(cors());
app.use(express.json());

// WebSocket 客户端集合
const clients = new Map();

// REST API

// 获取所有球队
app.get('/api/teams', (req, res) => {
  const teams = repository.getSetupTeams();
  res.json(teams);
});

// 获取所有比赛
app.get('/api/matches', (req, res) => {
  const matches = db.prepare('SELECT * FROM matches').all();
  res.json(matches);
});

// 获取单个比赛
app.get('/api/matches/:id', (req, res) => {
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.id);
  if (match) {
    res.json(normalizeLiveMatch(match));
  } else {
    res.status(404).json({ error: '比赛不存在' });
  }
});

// 创建比赛
app.post('/api/matches', (req, res) => {
  const { homeTeamId, guestTeamId } = req.body;
  const id = uuidv4();

  db.prepare(`
    INSERT INTO matches (id, home_team_id, guest_team_id, home_score, guest_score, quarter, status)
    VALUES (?, ?, ?, 0, 0, 1, 'ongoing')
  `).run(id, homeTeamId, guestTeamId);

  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(id);
  console.log(`创建比赛: ${id}`);
  res.json(normalizeLiveMatch(match));
});

// 记录得分
app.post('/api/matches/:id/score', (req, res) => {
  const { team, points } = req.body;
  const matchId = req.params.id;

  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId);
  if (!match) {
    return res.status(404).json({ error: '比赛不存在' });
  }

  // 更新比分
  if (team === 'home') {
    db.prepare('UPDATE matches SET home_score = home_score + ? WHERE id = ?').run(points, matchId);
  } else if (team === 'guest') {
    db.prepare('UPDATE matches SET guest_score = guest_score + ? WHERE id = ?').run(points, matchId);
  }

  // 记录事件
  db.prepare(`
    INSERT INTO events (match_id, event_type, team, value, quarter)
    VALUES (?, 'score', ?, ?, (SELECT quarter FROM matches WHERE id = ?))
  `).run(matchId, team, points, matchId);

  const updatedMatch = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId);
  console.log(`得分: ${team} +${points}, 比分 ${updatedMatch.home_score}-${updatedMatch.guest_score}`);

  // 广播更新
  broadcastUpdate(matchId, updatedMatch);
  res.json(normalizeLiveMatch(updatedMatch));
});

// 撤销
app.post('/api/matches/:id/undo', (req, res) => {
  const matchId = req.params.id;

  const lastEvent = db.prepare(`
    SELECT * FROM events WHERE match_id = ? AND event_type = 'score' ORDER BY id DESC LIMIT 1
  `).get(matchId);

  if (!lastEvent) {
    return res.status(400).json({ error: '没有可撤销的操作' });
  }

  // 回退比分
  if (lastEvent.team === 'home') {
    db.prepare('UPDATE matches SET home_score = MAX(0, home_score - ?) WHERE id = ?').run(lastEvent.value, matchId);
  } else {
    db.prepare('UPDATE matches SET guest_score = MAX(0, guest_score - ?) WHERE id = ?').run(lastEvent.value, matchId);
  }

  // 删除事件
  db.prepare('DELETE FROM events WHERE id = ?').run(lastEvent.id);

  const updatedMatch = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId);
  console.log(`撤销: ${lastEvent.team} -${lastEvent.value}`);

  broadcastUpdate(matchId, updatedMatch);
  res.json(normalizeLiveMatch(updatedMatch));
});

// 切换节次
app.put('/api/matches/:id/quarter', (req, res) => {
  const { quarter } = req.body;
  const matchId = req.params.id;

  db.prepare('UPDATE matches SET quarter = ? WHERE id = ?').run(quarter, matchId);

  const updatedMatch = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId);
  console.log(`切换节次: 第${quarter}节`);

  broadcastUpdate(matchId, updatedMatch);
  res.json(normalizeLiveMatch(updatedMatch));
});

// 管理查询 API
app.get('/api/manage/metadata', (req, res) => {
  try {
    const matches = repository.listManagedMatches();
    const teams = repository.listManagedTeams();
    const players = repository.listPlayers();
    const standings = repository.listStandings();
    const statistics = repository.listStatistics();
    res.json({
      minimumFields: repository.stats.minimumFields,
      counts: {
        matches: matches.length,
        teams: teams.length,
        players: players.length,
        standings: standings.length,
        statistics: statistics.length
      }
    });
  } catch (error) {
    handleRepositoryError(res, error);
  }
});

app.get('/api/manage/matches', (req, res) => {
  try {
    const matches = repository.listManagedMatches(req.query);
    res.json(matches);
  } catch (error) {
    handleRepositoryError(res, error);
  }
});

app.post('/api/manage/matches', (req, res) => {
  try {
    const match = repository.createManagedMatch(req.body);
    res.status(201).json(match);
  } catch (error) {
    handleRepositoryError(res, error);
  }
});

app.get('/api/manage/matches/:id', (req, res) => {
  try {
    const match = repository.getManagedMatch(req.params.id);
    if (!match) {
      return res.status(404).json({ error: '比赛不存在' });
    }
    res.json(match);
  } catch (error) {
    handleRepositoryError(res, error);
  }
});

app.get('/api/manage/teams', (req, res) => {
  try {
    const teams = repository.listManagedTeams(req.query);
    res.json(teams);
  } catch (error) {
    handleRepositoryError(res, error);
  }
});

app.get('/api/manage/players', (req, res) => {
  try {
    const players = repository.listPlayers(req.query);
    res.json(players);
  } catch (error) {
    handleRepositoryError(res, error);
  }
});

app.get('/api/manage/standings', (req, res) => {
  try {
    const standings = repository.listStandings(req.query);
    res.json(standings);
  } catch (error) {
    handleRepositoryError(res, error);
  }
});

app.get('/api/manage/statistics', (req, res) => {
  try {
    const statistics = repository.listStatistics(req.query);
    res.json(statistics);
  } catch (error) {
    handleRepositoryError(res, error);
  }
});

// WebSocket 广播
function broadcastUpdate(matchId, match) {
  const normalizedMatch = normalizeLiveMatch(match);
  const message = JSON.stringify({
    type: 'score_update',
    data: {
      matchId: normalizedMatch.id,
      homeScore: normalizedMatch.homeScore,
      guestScore: normalizedMatch.guestScore,
      quarter: normalizedMatch.quarter,
      status: normalizedMatch.status,
      timestamp: Date.now()
    }
  });

  const matchClients = clients.get(matchId) || [];
  matchClients.forEach(client => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

function normalizeLiveMatch(match) {
  return {
    id: match.id,
    homeTeamId: match.home_team_id,
    guestTeamId: match.guest_team_id,
    homeScore: match.home_score,
    guestScore: match.guest_score,
    quarter: match.quarter,
    status: match.status
  };
}

function handleRepositoryError(res, error) {
  const statusCode = error.statusCode ?? 500;
  res.status(statusCode).json({
    error: error.message ?? '管理数据查询失败'
  });
}

// 创建服务器
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  console.log('WebSocket 连接');

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'subscribe' && msg.matchId) {
        if (!clients.has(msg.matchId)) {
          clients.set(msg.matchId, []);
        }
        clients.get(msg.matchId).push(ws);
        ws.matchId = msg.matchId;
        console.log(`订阅比赛: ${msg.matchId}`);
      }
    } catch (e) {
      console.error('消息解析错误:', e);
    }
  });

  ws.on('close', () => {
    if (ws.matchId && clients.has(ws.matchId)) {
      const matchClients = clients.get(ws.matchId).filter(c => c !== ws);
      clients.set(ws.matchId, matchClients);
    }
  });
});

const PORT = Number(process.env.PORT || 3000);
server.listen(PORT, () => {
  console.log(`BRSMS 后端运行在 http://localhost:${PORT}`);
  console.log(`WebSocket 运行在 ws://localhost:${PORT}/ws`);
});

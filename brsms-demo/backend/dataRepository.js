import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const CSV_FILES = {
  matches: 'matches(1).csv',
  teams: 'teams(1).csv',
  players: 'players(1).csv',
  standings: 'standings(1).csv',
  statistics: 'match_statistics(1).csv'
};

const MINIMUM_DATA_FIELDS = {
  matches: ['match_id', 'home_team_id', 'away_team_id'],
  teams: ['team_id', 'team_name'],
  players: ['player_id', 'player_name', 'team_id'],
  standings: ['standing_id', 'team_id', 'rank'],
  statistics: ['stat_id', 'match_id', 'player_id', 'team_id']
};

function parseValue(value) {
  const trimmed = value?.trim() ?? '';
  if (trimmed === '') {
    return null;
  }
  const numeric = Number(trimmed);
  return Number.isNaN(numeric) ? trimmed : numeric;
}

function parseCsv(text) {
  const rows = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].split(',').map((header) => header.replace(/^\uFEFF/, '').trim());

  return rows.slice(1).map((line) => {
    const values = line.split(',');
    return headers.reduce((record, header, index) => {
      record[header] = parseValue(values[index] ?? '');
      return record;
    }, {});
  });
}

function isValidRecord(record, fields) {
  return fields.every((field) => record[field] !== null && record[field] !== undefined && record[field] !== '');
}

function toNonNegativeInteger(value, fieldName) {
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < 0) {
    const error = new Error(`${fieldName} 必须为非负整数`);
    error.statusCode = 400;
    throw error;
  }
  return numeric;
}

function raiseValidation(message) {
  const error = new Error(message);
  error.statusCode = 400;
  throw error;
}

function normalizeTeamName(name) {
  return String(name ?? '').trim().replace(/\s+/g, ' ');
}

function normalizePersonName(name) {
  return String(name ?? '').trim().replace(/\s+/g, ' ');
}

export function createDataRepository({ dataDir, liveDb }) {
  const stats = {
    minimumFields: MINIMUM_DATA_FIELDS
  };

  const managementDbPath = join(dataDir, 'brsms.db');
  const managementDb = existsSync(managementDbPath) ? new Database(managementDbPath, { readonly: true }) : null;

  const csvCache = new Map();

  function readCsv(key) {
    if (csvCache.has(key)) {
      return csvCache.get(key);
    }

    const fileName = CSV_FILES[key];
    const filePath = join(dataDir, fileName);
    if (!existsSync(filePath)) {
      csvCache.set(key, []);
      return [];
    }

    const parsed = parseCsv(readFileSync(filePath, 'utf-8')).filter((record) =>
      isValidRecord(record, MINIMUM_DATA_FIELDS[key])
    );
    csvCache.set(key, parsed);
    return parsed;
  }

  function canReadTable(tableName) {
    if (!managementDb) {
      return false;
    }
    const row = managementDb
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
      .get(tableName);
    return Boolean(row);
  }

  function canReadLiveTable(tableName) {
    const row = liveDb
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
      .get(tableName);
    return Boolean(row);
  }

  function listLiveTeams() {
    return liveDb.prepare('SELECT * FROM teams').all().map((team) => ({
      id: team.id,
      name: team.name
    }));
  }

  function listManualTeams() {
    return liveDb
      .prepare("SELECT * FROM teams WHERE id LIKE 'manual-team-%' ORDER BY name")
      .all()
      .map((team) => ({
        id: team.id,
        name: team.name
      }));
  }

  function listManualPlayers() {
    if (!canReadLiveTable('manual_players')) {
      return [];
    }
    const teamsById = teamMap();
    return liveDb
      .prepare('SELECT * FROM manual_players ORDER BY created_at DESC, id DESC')
      .all()
      .map((player) => ({
        id: String(player.id),
        name: normalizePersonName(player.name) || String(player.id),
        teamId: String(player.team_id),
        teamName: teamsById.get(String(player.team_id))?.name ?? String(player.team_id),
        sportType: '篮球',
        position: null,
        jerseyNumber: null,
        birthDate: null,
        heightCm: null,
        weightKg: null,
        nationality: null,
        joinDate: null,
        status: '手工录入'
      }));
  }

  function mergeTeams(...teamGroups) {
    const teamsById = new Map();
    teamGroups.flat().forEach((team) => {
      if (!team?.id) {
        return;
      }
      teamsById.set(String(team.id), {
        id: String(team.id),
        name: normalizeTeamName(team.name) || String(team.id)
      });
    });
    return Array.from(teamsById.values());
  }

  function getReferenceTeams() {
    const manualTeams = listManualTeams();

    if (canReadTable('teams')) {
      const rows = managementDb.prepare('SELECT * FROM teams').all();
      if (rows.length > 2) {
        const databaseTeams = rows.map((team) => ({
          id: team.id,
          name: team.name
        }));
        return mergeTeams(databaseTeams, manualTeams);
      }
    }

    const csvTeams = readCsv('teams');
    if (csvTeams.length > 0) {
      return mergeTeams(
        csvTeams.map((team) => ({
          id: team.team_id,
          name: team.team_name
        })),
        manualTeams
      );
    }

    return listLiveTeams();
  }

  function teamMap() {
    return new Map(getReferenceTeams().map((team) => [team.id, team]));
  }

  function listManualMatches() {
    if (!canReadTable('manual_matches')) {
      return [];
    }

    const teamsById = teamMap();
    return managementDb
      .prepare('SELECT * FROM manual_matches ORDER BY created_at DESC, id DESC')
      .all()
      .map((match) => {
        const homeTeam = teamsById.get(match.home_team_id) ?? null;
        const awayTeam = teamsById.get(match.away_team_id) ?? null;
        return {
          id: String(match.id),
          sportType: match.sport_type ?? '篮球',
          tournamentType: match.tournament_type ?? '未分类',
          matchDate: match.match_date ?? null,
          matchTime: null,
          venue: match.venue ?? null,
          homeTeamId: String(match.home_team_id),
          awayTeamId: String(match.away_team_id),
          homeTeamName: homeTeam?.name ?? String(match.home_team_id),
          awayTeamName: awayTeam?.name ?? String(match.away_team_id),
          homeScore: Number(match.home_score ?? 0),
          awayScore: Number(match.away_score ?? 0),
          winnerTeamId: match.winner_team_id ? String(match.winner_team_id) : null,
          status: match.status ?? '已结束',
          referee: null,
          spectators: 0,
          weather: null,
          source: 'manual'
        };
      });
  }

  function normalizeManagedMatches() {
    const teamsById = teamMap();
    const csvMatches = readCsv('matches');
    const manualMatches = listManualMatches();

    if (csvMatches.length > 0) {
      const normalizedCsvMatches = csvMatches.map((match) => {
        const homeTeam = teamsById.get(match.home_team_id) ?? null;
        const awayTeam = teamsById.get(match.away_team_id) ?? null;
        return {
          id: String(match.match_id),
          sportType: match.sport_type ?? '未知',
          tournamentType: match.tournament_type ?? '未分类',
          matchDate: match.match_date ?? null,
          matchTime: match.match_time ?? null,
          venue: match.venue ?? null,
          homeTeamId: String(match.home_team_id),
          awayTeamId: String(match.away_team_id),
          homeTeamName: homeTeam?.name ?? String(match.home_team_id),
          awayTeamName: awayTeam?.name ?? String(match.away_team_id),
          homeScore: Number(match.home_score ?? 0),
          awayScore: Number(match.away_score ?? 0),
          winnerTeamId: match.winner_team_id ? String(match.winner_team_id) : null,
          status: match.status ?? '未知',
          referee: match.referee ?? null,
          spectators: Number(match.spectators ?? 0),
          weather: match.weather ?? null,
          source: 'csv'
        };
      });
      return [...manualMatches, ...normalizedCsvMatches];
    }

    const liveMatches = liveDb.prepare('SELECT * FROM matches').all().map((match) => ({
      id: match.id,
      sportType: '篮球',
      tournamentType: '实时比赛',
      matchDate: null,
      matchTime: null,
      venue: null,
      homeTeamId: match.home_team_id,
      awayTeamId: match.guest_team_id,
      homeTeamName: teamsById.get(match.home_team_id)?.name ?? match.home_team_id,
      awayTeamName: teamsById.get(match.guest_team_id)?.name ?? match.guest_team_id,
      homeScore: Number(match.home_score ?? 0),
      awayScore: Number(match.guest_score ?? 0),
      winnerTeamId: null,
      status: match.status ?? 'ongoing',
      referee: null,
      spectators: 0,
      weather: null,
      quarter: Number(match.quarter ?? 1),
      source: 'live'
    }));
    return [...manualMatches, ...liveMatches];
  }

  function normalizeTeams() {
    const standingsByTeamId = new Map(
      readCsv('standings').map((standing) => [String(standing.team_id), standing])
    );

    const csvTeams = readCsv('teams');
    if (csvTeams.length > 0) {
      const normalizedCsvTeams = csvTeams.map((team) => {
        const standing = standingsByTeamId.get(String(team.team_id));
        return {
          id: String(team.team_id),
          name: team.team_name ?? String(team.team_id),
          sportType: team.sport_type ?? '未知',
          foundedYear: Number(team.founded_year ?? 0),
          coach: team.coach ?? null,
          city: team.city ?? null,
          homeVenue: team.home_venue ?? null,
          rank: standing ? Number(standing.rank ?? 0) : null,
          points: standing ? Number(standing.points ?? 0) : null,
          winRate: standing ? Number(standing.win_rate ?? 0) : null
        };
      });
      const csvTeamIds = new Set(normalizedCsvTeams.map((team) => team.id));
      const normalizedManualTeams = listManualTeams()
        .filter((team) => !csvTeamIds.has(team.id))
        .map((team) => ({
          id: team.id,
          name: team.name,
          sportType: '篮球',
          foundedYear: null,
          coach: null,
          city: null,
          homeVenue: null,
          rank: null,
          points: null,
          winRate: null
        }));
      return [...normalizedCsvTeams, ...normalizedManualTeams];
    }

    return listLiveTeams().map((team) => ({
      id: team.id,
      name: team.name,
      sportType: '篮球',
      foundedYear: null,
      coach: null,
      city: null,
      homeVenue: null,
      rank: null,
      points: null,
      winRate: null
    }));
  }

  function normalizePlayers() {
    const teamsById = teamMap();
    const csvPlayers = readCsv('players').map((player) => ({
      id: String(player.player_id),
      name: player.player_name ?? String(player.player_id),
      teamId: String(player.team_id),
      teamName: teamsById.get(String(player.team_id))?.name ?? String(player.team_id),
      sportType: player.sport_type ?? '未知',
      position: player.position ?? null,
      jerseyNumber: Number(player.jersey_number ?? 0),
      birthDate: player.birth_date ?? null,
      heightCm: Number(player.height_cm ?? 0),
      weightKg: Number(player.weight_kg ?? 0),
      nationality: player.nationality ?? null,
      joinDate: player.join_date ?? null,
      status: player.status ?? null
    }));
    const csvPlayerIds = new Set(csvPlayers.map((player) => player.id));
    const manualPlayers = listManualPlayers().filter((player) => !csvPlayerIds.has(player.id));
    return [...manualPlayers, ...csvPlayers];
  }

  function normalizeStandings() {
    const teamsById = teamMap();
    return readCsv('standings').map((standing) => ({
      id: String(standing.standing_id),
      teamId: String(standing.team_id),
      teamName: teamsById.get(String(standing.team_id))?.name ?? String(standing.team_id),
      sportType: standing.sport_type ?? '未知',
      season: String(standing.season ?? ''),
      matchesPlayed: Number(standing.matches_played ?? 0),
      wins: Number(standing.wins ?? 0),
      losses: Number(standing.losses ?? 0),
      draws: Number(standing.draws ?? 0),
      goalsFor: Number(standing.goals_for ?? 0),
      goalsAgainst: Number(standing.goals_against ?? 0),
      goalDifference: Number(standing.goal_difference ?? 0),
      points: Number(standing.points ?? 0),
      winRate: Number(standing.win_rate ?? 0),
      rank: Number(standing.rank ?? 0),
      form: standing.form ?? ''
    }));
  }

  function normalizeStatistics() {
    const playersById = new Map(normalizePlayers().map((player) => [player.id, player]));
    const teamsById = teamMap();
    const csvStatistics = readCsv('statistics').map((stat) => ({
      id: String(stat.stat_id),
      matchId: String(stat.match_id),
      playerId: String(stat.player_id),
      playerName: playersById.get(String(stat.player_id))?.name ?? String(stat.player_id),
      teamId: String(stat.team_id),
      teamName: teamsById.get(String(stat.team_id))?.name ?? String(stat.team_id),
      minutesPlayed: Number(stat.minutes_played ?? 0),
      points: Number(stat.points ?? 0),
      rebounds: Number(stat.rebounds ?? 0),
      assists: Number(stat.assists ?? 0),
      steals: Number(stat.steals ?? 0),
      blocks: Number(stat.blocks ?? 0),
      turnovers: Number(stat.turnovers ?? 0),
      efficiency: Number(stat.efficiency ?? 0),
      rating: Number(stat.rating ?? 0),
      source: 'csv'
    }));
    const manualStatistics = canReadTable('manual_match_statistics')
      ? managementDb
          .prepare('SELECT * FROM manual_match_statistics ORDER BY created_at DESC, id DESC')
          .all()
          .map((stat) => ({
            id: String(stat.id),
            matchId: String(stat.match_id),
            playerId: String(stat.player_id),
            playerName: playersById.get(String(stat.player_id))?.name ?? String(stat.player_id),
            teamId: String(stat.team_id),
            teamName: teamsById.get(String(stat.team_id))?.name ?? String(stat.team_id),
            minutesPlayed: 0,
            points: Number(stat.points ?? 0),
            rebounds: Number(stat.rebounds ?? 0),
            assists: Number(stat.assists ?? 0),
            steals: 0,
            blocks: 0,
            turnovers: 0,
            efficiency: 0,
            rating: 0,
            source: 'manual'
          }))
      : [];
    return [...manualStatistics, ...csvStatistics];
  }

  function nextManualMatchId() {
    const ids = [
      ...readCsv('matches').map((match) => String(match.match_id ?? '')),
      ...liveDb.prepare('SELECT id FROM manual_matches').all().map((match) => String(match.id ?? ''))
    ];
    const maxNumber = ids.reduce((max, id) => {
      const match = /^M(\d+)$/.exec(id);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);
    return `M${String(maxNumber + 1).padStart(5, '0')}`;
  }

  function resolveTeamId(teamId, teamName, fieldLabel) {
    const normalizedTeamId = String(teamId ?? '').trim();
    const normalizedTeamName = normalizeTeamName(teamName);
    const teamsById = teamMap();

    if (normalizedTeamId) {
      if (!teamsById.has(normalizedTeamId)) {
        raiseValidation(`${fieldLabel}不存在`);
      }
      return normalizedTeamId;
    }

    if (!normalizedTeamName) {
      raiseValidation(`${fieldLabel}不能为空`);
    }

    const existingTeam = Array.from(teamsById.values()).find(
      (team) => normalizeTeamName(team.name) === normalizedTeamName
    );
    if (existingTeam) {
      return existingTeam.id;
    }

    const newTeamId = `manual-team-${randomUUID()}`;
    liveDb
      .prepare('INSERT INTO teams (id, name) VALUES (?, ?)')
      .run(newTeamId, normalizedTeamName);
    return newTeamId;
  }

  function resolveStatisticTeamId(item, homeTeamId, awayTeamId, index) {
    const teamSide = String(item?.teamSide ?? '').trim();
    if (teamSide === 'home') {
      return homeTeamId;
    }
    if (teamSide === 'away') {
      return awayTeamId;
    }
    return resolveTeamId(item?.teamId, item?.teamName, `第 ${index + 1} 行技术统计的球队`);
  }

  function resolvePlayerId(item, teamId, index) {
    const playerId = String(item?.playerId ?? '').trim();
    const playerName = normalizePersonName(item?.playerName);
    const players = normalizePlayers();
    const playersById = new Map(players.map((player) => [player.id, player]));

    if (playerId) {
      const player = playersById.get(playerId);
      if (!player) {
        raiseValidation(`第 ${index + 1} 行技术统计的球员不存在`);
      }
      if (player.teamId !== teamId) {
        raiseValidation(`第 ${index + 1} 行技术统计的球员不属于所选球队`);
      }
      return playerId;
    }

    if (!playerName) {
      raiseValidation(`第 ${index + 1} 行技术统计缺少球员`);
    }

    const existingPlayer = players.find(
      (player) => player.teamId === teamId && normalizePersonName(player.name) === playerName
    );
    if (existingPlayer) {
      return existingPlayer.id;
    }

    const newPlayerId = `manual-player-${randomUUID()}`;
    liveDb
      .prepare('INSERT INTO manual_players (id, name, team_id) VALUES (?, ?, ?)')
      .run(newPlayerId, playerName, teamId);
    return newPlayerId;
  }

  function validateManagedMatchInput(input) {
    const tournamentType = String(input?.tournamentType ?? '').trim();
    const matchDate = String(input?.matchDate ?? '').trim();
    const venue = String(input?.venue ?? '').trim();
    const homeTeamId = resolveTeamId(input?.homeTeamId, input?.homeTeamName, '主队');
    const awayTeamId = resolveTeamId(input?.awayTeamId, input?.awayTeamName, '客队');
    const status = String(input?.status ?? '已结束').trim() || '已结束';

    if (!tournamentType) {
      raiseValidation('赛事类型不能为空');
    }
    if (homeTeamId === awayTeamId) {
      raiseValidation('主队和客队不能相同');
    }

    const homeScore = toNonNegativeInteger(input?.homeScore, '主队得分');
    const awayScore = toNonNegativeInteger(input?.awayScore, '客队得分');
    const allowedTeamIds = new Set([homeTeamId, awayTeamId]);
    const statistics = Array.isArray(input?.statistics) ? input.statistics : [];
    const normalizedStatistics = statistics.map((item, index) => {
      const teamId = resolveStatisticTeamId(item, homeTeamId, awayTeamId, index);
      if (!allowedTeamIds.has(teamId)) {
        raiseValidation(`第 ${index + 1} 行技术统计的球队不属于本场比赛`);
      }
      const playerId = resolvePlayerId(item, teamId, index);
      return {
        playerId,
        teamId,
        points: toNonNegativeInteger(item?.points ?? 0, `第 ${index + 1} 行得分`),
        rebounds: toNonNegativeInteger(item?.rebounds ?? 0, `第 ${index + 1} 行篮板`),
        assists: toNonNegativeInteger(item?.assists ?? 0, `第 ${index + 1} 行助攻`)
      };
    });

    return {
      tournamentType,
      matchDate: matchDate || null,
      venue: venue || null,
      homeTeamId,
      awayTeamId,
      homeScore,
      awayScore,
      winnerTeamId: homeScore === awayScore ? null : homeScore > awayScore ? homeTeamId : awayTeamId,
      status,
      statistics: normalizedStatistics
    };
  }

  function assertDataAvailable(records, resourceName) {
    if (records.length === 0) {
      const error = new Error(`${resourceName} 数据源不可用`);
      error.statusCode = 503;
      throw error;
    }
    return records;
  }

  return {
    stats,
    getSetupTeams() {
      return listLiveTeams();
    },
    createManagedMatch(input) {
      const createMatch = liveDb.transaction(() => {
        const data = validateManagedMatchInput(input);
        const matchId = nextManualMatchId();
        liveDb
          .prepare(
            `INSERT INTO manual_matches (
              id, sport_type, tournament_type, match_date, venue,
              home_team_id, away_team_id, home_score, away_score, winner_team_id, status
            ) VALUES (?, '篮球', ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .run(
            matchId,
            data.tournamentType,
            data.matchDate,
            data.venue,
            data.homeTeamId,
            data.awayTeamId,
            data.homeScore,
            data.awayScore,
            data.winnerTeamId,
            data.status
          );

        data.statistics.forEach((stat, index) => {
          liveDb
            .prepare(
              `INSERT INTO manual_match_statistics (
                id, match_id, player_id, team_id, points, rebounds, assists
              ) VALUES (?, ?, ?, ?, ?, ?, ?)`
            )
            .run(
              `${matchId}-S${String(index + 1).padStart(3, '0')}`,
              matchId,
              stat.playerId,
              stat.teamId,
              stat.points,
              stat.rebounds,
              stat.assists
            );
        });

        return matchId;
      });

      const matchId = createMatch();
      return this.getManagedMatch(matchId);
    },
    listManagedMatches(filters = {}) {
      const records = assertDataAvailable(normalizeManagedMatches(), '比赛');
      const query = String(filters.query ?? '').trim().toLowerCase();
      const sportType = String(filters.sportType ?? '').trim();
      return records.filter((match) => {
        const matchesQuery =
          !query ||
          [
            match.id,
            match.homeTeamName,
            match.awayTeamName,
            match.venue,
            match.tournamentType
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));
        const matchesSportType = !sportType || match.sportType === sportType;
        return matchesQuery && matchesSportType;
      });
    },
    getManagedMatch(matchId) {
      const match = this.listManagedMatches().find((item) => item.id === matchId);
      if (!match) {
        return null;
      }
      const statistics = this.listStatistics({ matchId });
      return {
        ...match,
        statistics,
        topPerformers: statistics
          .slice()
          .sort((left, right) => right.points - left.points)
          .slice(0, 5)
      };
    },
    listManagedTeams(filters = {}) {
      const records = assertDataAvailable(normalizeTeams(), '球队');
      const query = String(filters.query ?? '').trim().toLowerCase();
      const sportType = String(filters.sportType ?? '').trim();
      return records.filter((team) => {
        const matchesQuery =
          !query ||
          [team.id, team.name, team.city, team.coach]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));
        const matchesSportType = !sportType || team.sportType === sportType;
        return matchesQuery && matchesSportType;
      });
    },
    listPlayers(filters = {}) {
      const records = assertDataAvailable(normalizePlayers(), '球员');
      const query = String(filters.query ?? '').trim().toLowerCase();
      const sportType = String(filters.sportType ?? '').trim();
      const teamId = String(filters.teamId ?? '').trim();
      return records.filter((player) => {
        const matchesQuery =
          !query ||
          [player.id, player.name, player.teamName, player.position]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query));
        const matchesSportType = !sportType || player.sportType === sportType;
        const matchesTeam = !teamId || player.teamId === teamId;
        return matchesQuery && matchesSportType && matchesTeam;
      });
    },
    listStandings(filters = {}) {
      const records = assertDataAvailable(normalizeStandings(), '积分榜');
      const sportType = String(filters.sportType ?? '').trim();
      const season = String(filters.season ?? '').trim();
      return records
        .filter((standing) => {
          const matchesSportType = !sportType || standing.sportType === sportType;
          const matchesSeason = !season || standing.season === season;
          return matchesSportType && matchesSeason;
        })
        .sort((left, right) => {
          if (right.points !== left.points) {
            return right.points - left.points;
          }
          return left.teamName.localeCompare(right.teamName, 'zh-Hans-CN');
        })
        .map((standing, index) => ({
          ...standing,
          rank: index + 1
        }));
    },
    listStatistics(filters = {}) {
      const records = assertDataAvailable(normalizeStatistics(), '技术统计');
      const matchId = String(filters.matchId ?? '').trim();
      const teamId = String(filters.teamId ?? '').trim();
      const playerId = String(filters.playerId ?? '').trim();
      return records.filter((stat) => {
        const matchesMatch = !matchId || stat.matchId === matchId;
        const matchesTeam = !teamId || stat.teamId === teamId;
        const matchesPlayer = !playerId || stat.playerId === playerId;
        return matchesMatch && matchesTeam && matchesPlayer;
      });
    }
  };
}

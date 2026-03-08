let ws = null;
let matchId = null;
let onMessageCallback = null;

export function connectWebSocket(mid, onMessage) {
  matchId = mid;
  onMessageCallback = onMessage;

  ws = new WebSocket('ws://localhost:3000/ws');

  ws.onopen = () => {
    console.log('WebSocket 已连接');
    ws.send(JSON.stringify({ type: 'subscribe', matchId }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessageCallback(data);
  };

  ws.onerror = (error) => {
    console.error('WebSocket 错误:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket 已断开');
  };
}

export function disconnectWebSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }
}

export async function createMatch(homeTeamId, guestTeamId) {
  const response = await fetch('http://localhost:3000/api/matches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ homeTeamId, guestTeamId })
  });
  return response.json();
}

export async function getMatch(matchId) {
  const response = await fetch(`http://localhost:3000/api/matches/${matchId}`);
  return response.json();
}

export async function recordScore(matchId, team, points) {
  const response = await fetch(`http://localhost:3000/api/matches/${matchId}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team, points })
  });
  return response.json();
}

export async function undoScore(matchId) {
  const response = await fetch(`http://localhost:3000/api/matches/${matchId}/undo`, {
    method: 'POST'
  });
  return response.json();
}

export async function changeQuarter(matchId, quarter) {
  const response = await fetch(`http://localhost:3000/api/matches/${matchId}/quarter`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quarter })
  });
  return response.json();
}

export async function getTeams() {
  const response = await fetch('http://localhost:3000/api/teams');
  return response.json();
}
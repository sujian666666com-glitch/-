const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:3000'
const WS_ORIGIN =
  import.meta.env.VITE_WS_ORIGIN ||
  API_ORIGIN.replace(/^http/, (protocol: string) => (protocol === 'https' ? 'wss' : 'ws'))

async function request(path: string, options?: RequestInit) {
  const response = await fetch(`${API_ORIGIN}${path}`, options)
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: '请求失败' }))
    throw new Error(body.error ?? '请求失败')
  }
  return response.json()
}

export function getWebSocketUrl() {
  return `${WS_ORIGIN}/ws`
}

export function getTeams() {
  return request('/api/teams');
}

export function createMatch(homeTeamId: string, guestTeamId: string) {
  return request('/api/matches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ homeTeamId, guestTeamId })
  })
}

export function getMatch(matchId: string) {
  return request(`/api/matches/${matchId}`);
}

export function recordScore(matchId: string, team: string, points: number) {
  return request(`/api/matches/${matchId}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team, points })
  });
}

export function undoScore(matchId: string) {
  return request(`/api/matches/${matchId}/undo`, {
    method: 'POST'
  });
}

export function changeQuarter(matchId: string, quarter: number) {
  return request(`/api/matches/${matchId}/quarter`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quarter })
  });
}

export function getManagedMatches(params: Record<string, string> = {}) {
  return request(`/api/manage/matches?${new URLSearchParams(params).toString()}`)
}

export function createManagedMatch(payload: Record<string, unknown>) {
  return request('/api/manage/matches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export function updateManagedMatch(matchId: string, payload: Record<string, unknown>) {
  return request(`/api/manage/matches/${matchId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export function getManagementMetadata() {
  return request('/api/manage/metadata')
}

export function getManagedMatch(matchId: string) {
  return request(`/api/manage/matches/${matchId}`);
}

export function getManagedTeams(params: Record<string, string> = {}) {
  return request(`/api/manage/teams?${new URLSearchParams(params).toString()}`)
}

export function getManagedPlayers(params: Record<string, string> = {}) {
  return request(`/api/manage/players?${new URLSearchParams(params).toString()}`)
}

export function getManagedStandings(params: Record<string, string> = {}) {
  return request(`/api/manage/standings?${new URLSearchParams(params).toString()}`)
}

export function getManagedStatistics(params: Record<string, string> = {}) {
  return request(`/api/manage/statistics?${new URLSearchParams(params).toString()}`)
}

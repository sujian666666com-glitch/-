import {
  changeQuarter,
  createMatch,
  getMatch,
  getTeams,
  getWebSocketUrl,
  recordScore,
  undoScore
} from '@/services/api'

type ScoreUpdateMessage = {
  type: 'score_update'
  data: {
    matchId: string
    homeScore: number
    guestScore: number
    quarter: number
    status: string
    timestamp: number
  }
}

let ws: WebSocket | null = null
let matchId: string | null = null
let onMessageCallback: ((message: ScoreUpdateMessage) => void) | null = null

export function connectWebSocket(mid: string, onMessage: (message: ScoreUpdateMessage) => void) {
  matchId = mid
  onMessageCallback = onMessage

  ws = new WebSocket(getWebSocketUrl())

  ws.onopen = () => {
    console.log('WebSocket 已连接')
    ws?.send(JSON.stringify({ type: 'subscribe', matchId }))
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data) as ScoreUpdateMessage
    onMessageCallback?.(data)
  }

  ws.onerror = (error) => {
    console.error('WebSocket 错误:', error)
  }

  ws.onclose = () => {
    console.log('WebSocket 已断开')
  }
}

export function disconnectWebSocket() {
  if (ws) {
    ws.close()
    ws = null
  }
}

export { createMatch, getMatch, recordScore, undoScore, changeQuarter, getTeams }

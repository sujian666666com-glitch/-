import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { connectWebSocket, disconnectWebSocket } from '@/services/websocket'

export interface Match {
  id: string
  homeTeamId: string
  guestTeamId: string
  homeScore: number
  guestScore: number
  quarter: number
  status: string
}

export const useMatchStore = defineStore('match', () => {
  const currentMatch = ref<Match | null>(null)
  const isConnected = ref(false)

  const homeScore = computed(() => currentMatch.value?.homeScore ?? 0)
  const guestScore = computed(() => currentMatch.value?.guestScore ?? 0)
  const quarter = computed(() => currentMatch.value?.quarter ?? 1)

  function setCurrentMatch(match: Match) {
    currentMatch.value = match
    connectWebSocket(match.id, (data) => {
      if (data.type === 'score_update') {
        currentMatch.value = {
          ...currentMatch.value!,
          homeScore: data.data.homeScore,
          guestScore: data.data.guestScore,
          quarter: data.data.quarter,
          status: data.data.status
        }
      }
    })
    isConnected.value = true
  }

  function updateScore(homeScore: number, guestScore: number) {
    if (currentMatch.value) {
      currentMatch.value.homeScore = homeScore
      currentMatch.value.guestScore = guestScore
    }
  }

  return {
    currentMatch,
    isConnected,
    homeScore,
    guestScore,
    quarter,
    setCurrentMatch,
    updateScore
  }
})
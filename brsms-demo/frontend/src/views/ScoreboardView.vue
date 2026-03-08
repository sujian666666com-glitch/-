<template>
  <div class="scoreboard">
    <div class="header">
      <div class="quarter">第 {{ matchStore.quarter }} 节</div>
    </div>

    <div class="score-display">
      <div class="team home">
        <div class="team-name">主队</div>
        <div class="score">{{ matchStore.homeScore }}</div>
      </div>

      <div class="vs">VS</div>

      <div class="team guest">
        <div class="team-name">客队</div>
        <div class="score">{{ matchStore.guestScore }}</div>
      </div>
    </div>

    <div class="footer">
      <span class="status" :class="{ connected: matchStore.isConnected }">
        {{ matchStore.isConnected ? '● 已连接' : '○ 未连接' }}
      </span>
      <router-link :to="`/control/${matchId}`" class="control-link">
        进入控制台
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMatchStore } from '@/stores/matchStore'
import { getMatch, disconnectWebSocket } from '@/services/websocket'

const route = useRoute()
const matchStore = useMatchStore()
const matchId = route.params.matchId as string

onMounted(async () => {
  const match = await getMatch(matchId)
  matchStore.setCurrentMatch(match)
})

onUnmounted(() => {
  disconnectWebSocket()
})
</script>

<style scoped>
.scoreboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.header {
  margin-bottom: 40px;
}

.quarter {
  font-size: 36px;
  color: #f39c12;
  font-weight: bold;
}

.score-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 60px;
}

.team {
  text-align: center;
}

.team-name {
  font-size: 32px;
  color: #aaa;
  margin-bottom: 20px;
}

.score {
  font-size: 120px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 0 20px rgba(67, 97, 238, 0.5);
}

.home .score {
  color: #4361ee;
}

.guest .score {
  color: #e74c3c;
}

.vs {
  font-size: 48px;
  color: #333;
  font-weight: bold;
}

.footer {
  position: fixed;
  bottom: 20px;
  display: flex;
  gap: 20px;
  align-items: center;
}

.status {
  font-size: 14px;
  color: #e74c3c;
}

.status.connected {
  color: #2ecc71;
}

.control-link {
  color: #4361ee;
  text-decoration: none;
}

.control-link:hover {
  text-decoration: underline;
}
</style>
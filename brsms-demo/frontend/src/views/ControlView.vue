<template>
  <div class="control-panel">
    <div class="header">
      <h1>计分控制台</h1>
      <div class="quarter-info">第 {{ matchStore.quarter }} 节</div>
    </div>

    <div class="score-section">
      <div class="team-controls home">
        <div class="team-name">主队</div>
        <div class="score">{{ matchStore.homeScore }}</div>
        <div class="score-buttons">
          <button class="btn btn-primary btn-lg" @click="addScore('home', 1)">+1</button>
          <button class="btn btn-primary btn-lg" @click="addScore('home', 2)">+2</button>
          <button class="btn btn-primary btn-lg" @click="addScore('home', 3)">+3</button>
        </div>
      </div>

      <div class="team-controls guest">
        <div class="team-name">客队</div>
        <div class="score">{{ matchStore.guestScore }}</div>
        <div class="score-buttons">
          <button class="btn btn-primary btn-lg" @click="addScore('guest', 1)">+1</button>
          <button class="btn btn-primary btn-lg" @click="addScore('guest', 2)">+2</button>
          <button class="btn btn-primary btn-lg" @click="addScore('guest', 3)">+3</button>
        </div>
      </div>
    </div>

    <div class="action-section">
      <div class="quarter-controls">
        <span>节次:</span>
        <button
          v-for="q in 4"
          :key="q"
          class="btn"
          :class="{ 'btn-primary': matchStore.quarter === q }"
          @click="setQuarter(q)"
        >
          第{{ q }}节
        </button>
      </div>

      <div class="other-actions">
        <button class="btn btn-warning" @click="undo">撤销</button>
        <router-link :to="`/scoreboard/${matchId}`" class="btn btn-success">
          大屏显示
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMatchStore } from '@/stores/matchStore'
import { getMatch, recordScore, undoScore, changeQuarter } from '@/services/websocket'

const route = useRoute()
const matchStore = useMatchStore()
const matchId = route.params.matchId as string

onMounted(async () => {
  const match = await getMatch(matchId)
  matchStore.setCurrentMatch(match)
})

async function addScore(team: string, points: number) {
  await recordScore(matchId, team, points)
}

async function undo() {
  try {
    await undoScore(matchId)
  } catch (e) {
    alert('没有可撤销的操作')
  }
}

async function setQuarter(q: number) {
  await changeQuarter(matchId, q)
}
</script>

<style scoped>
.control-panel {
  min-height: 100vh;
  padding: 40px;
  background: #1a1a2e;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
}

h1 {
  font-size: 28px;
  color: #4361ee;
}

.quarter-info {
  font-size: 24px;
  color: #f39c12;
  font-weight: bold;
}

.score-section {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
}

.team-controls {
  flex: 1;
  background: #2a2a4a;
  border-radius: 16px;
  padding: 30px;
  text-align: center;
}

.team-controls.home {
  border: 3px solid #4361ee;
}

.team-controls.guest {
  border: 3px solid #e74c3c;
}

.team-name {
  font-size: 24px;
  color: #aaa;
  margin-bottom: 10px;
}

.score {
  font-size: 72px;
  font-weight: bold;
  margin-bottom: 20px;
}

.home .score {
  color: #4361ee;
}

.guest .score {
  color: #e74c3c;
}

.score-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.action-section {
  background: #2a2a4a;
  border-radius: 16px;
  padding: 30px;
}

.quarter-controls {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 20px;
}

.quarter-controls span {
  color: #aaa;
  font-size: 18px;
}

.other-actions {
  display: flex;
  gap: 10px;
}
</style>
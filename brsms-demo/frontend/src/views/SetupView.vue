<template>
  <div class="setup-page">
    <h1>BRSMS 比赛管理系统</h1>
    <h2>创建新比赛</h2>

    <div class="form-group">
      <label>主队</label>
      <select v-model="homeTeamId">
        <option v-for="team in teams" :key="team.id" :value="team.id">
          {{ team.name }}
        </option>
      </select>
    </div>

    <div class="form-group">
      <label>客队</label>
      <select v-model="guestTeamId">
        <option v-for="team in teams" :key="team.id" :value="team.id">
          {{ team.name }}
        </option>
      </select>
    </div>

    <div class="actions">
      <button class="btn btn-primary btn-lg" @click="startMatch">
        开始比赛
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTeams, createMatch } from '@/services/websocket'

const router = useRouter()
const teams = ref<any[]>([])
const homeTeamId = ref('team-home')
const guestTeamId = ref('team-guest')

onMounted(async () => {
  teams.value = await getTeams()
})

async function startMatch() {
  const match = await createMatch(homeTeamId.value, guestTeamId.value)
  router.push(`/control/${match.id}`)
}
</script>

<style scoped>
.setup-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px;
}

h1 {
  font-size: 48px;
  margin-bottom: 40px;
  color: #4361ee;
}

h2 {
  font-size: 24px;
  margin-bottom: 30px;
  color: #aaa;
}

.form-group {
  margin-bottom: 20px;
  width: 100%;
  max-width: 400px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
  color: #ccc;
}

select {
  width: 100%;
  padding: 12px;
  font-size: 18px;
  border: 2px solid #333;
  border-radius: 8px;
  background: #2a2a4a;
  color: #fff;
}

.actions {
  margin-top: 40px;
}
</style>
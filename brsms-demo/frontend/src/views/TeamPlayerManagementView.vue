<template>
  <div class="page-shell">
    <div class="library-shell container">
      <aside class="library-sidebar">
        <h1>球队与球员</h1>
        <p>像检索馆藏一样按球队、球员与位置筛选并查看核心资料。</p>
        <nav class="library-nav">
          <router-link to="/manage">总览</router-link>
          <router-link to="/manage/matches">比赛目录</router-link>
          <router-link to="/manage/matches/new">录入成绩</router-link>
          <router-link to="/manage/teams">球队与球员</router-link>
          <router-link to="/manage/statistics">积分榜与统计</router-link>
        </nav>
      </aside>

      <section class="content-panel">
        <h2>球队档案</h2>
        <div class="toolbar">
          <input v-model="teamQuery" placeholder="搜索球队/城市/教练" />
          <button class="btn btn-primary" @click="loadData">查询</button>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>球队</th>
              <th>城市</th>
              <th>主场</th>
              <th>排名</th>
              <th>积分</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="team in teams" :key="team.id">
              <td>{{ team.name }}</td>
              <td>{{ team.city || '-' }}</td>
              <td>{{ team.homeVenue || '-' }}</td>
              <td>{{ team.rank || '-' }}</td>
              <td>{{ team.points || '-' }}</td>
            </tr>
          </tbody>
        </table>

        <h2 style="margin-top: 28px;">球员档案</h2>
        <div class="toolbar">
          <input v-model="playerQuery" placeholder="搜索球员/位置/球队" />
          <select v-model="teamId">
            <option value="">全部球队</option>
            <option v-for="team in teams" :key="team.id" :value="team.id">{{ team.name }}</option>
          </select>
          <button class="btn btn-primary" @click="loadData">筛选</button>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>球员</th>
              <th>球队</th>
              <th>位置</th>
              <th>号码</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="player in players" :key="player.id">
              <td>{{ player.name }}</td>
              <td>{{ player.teamName }}</td>
              <td>{{ player.position }}</td>
              <td>{{ player.jerseyNumber }}</td>
              <td><span class="pill">{{ player.status || '未知' }}</span></td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getManagedPlayers, getManagedTeams } from '@/services/api'

const teams = ref<any[]>([])
const players = ref<any[]>([])
const teamQuery = ref('')
const playerQuery = ref('')
const teamId = ref('')

async function loadData() {
  teams.value = await getManagedTeams(teamQuery.value ? { query: teamQuery.value } : {})
  players.value = await getManagedPlayers({
    ...(playerQuery.value ? { query: playerQuery.value } : {}),
    ...(teamId.value ? { teamId: teamId.value } : {})
  })
}

onMounted(loadData)
</script>

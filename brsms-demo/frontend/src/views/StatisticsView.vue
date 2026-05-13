<template>
  <div class="page-shell">
    <div class="library-shell container">
      <aside class="library-sidebar">
        <h1>积分榜与统计</h1>
        <p>区分于实时大屏，这里用于查看赛季排名与比赛技术指标。</p>
        <nav class="library-nav">
          <router-link to="/manage">总览</router-link>
          <router-link to="/manage/matches">比赛目录</router-link>
          <router-link to="/manage/matches/new">录入成绩</router-link>
          <router-link to="/manage/teams">球队与球员</router-link>
          <router-link to="/manage/statistics">积分榜与统计</router-link>
        </nav>
      </aside>

      <section class="content-panel">
        <h2>积分榜</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th>排名</th>
              <th>球队</th>
              <th>胜</th>
              <th>负</th>
              <th>积分</th>
              <th>胜率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="standing in standings" :key="standing.id">
              <td>{{ standing.rank }}</td>
              <td>{{ standing.teamName }}</td>
              <td>{{ standing.wins }}</td>
              <td>{{ standing.losses }}</td>
              <td>{{ standing.points }}</td>
              <td>{{ standing.winRate }}%</td>
            </tr>
          </tbody>
        </table>

        <h2 style="margin-top: 28px;">技术统计总表</h2>
        <div class="toolbar">
          <input v-model="matchId" placeholder="按比赛编号筛选，如 M00001" />
          <button class="btn btn-primary" @click="loadData">筛选</button>
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>球员</th>
              <th>球队</th>
              <th>比赛</th>
              <th>得分</th>
              <th>篮板</th>
              <th>助攻</th>
              <th>效率值</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stat in statistics" :key="stat.id">
              <td>{{ stat.playerName }}</td>
              <td>{{ stat.teamName }}</td>
              <td>{{ stat.matchId }}</td>
              <td>{{ stat.points }}</td>
              <td>{{ stat.rebounds }}</td>
              <td>{{ stat.assists }}</td>
              <td>{{ stat.efficiency }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getManagedStandings, getManagedStatistics } from '@/services/api'

const standings = ref<any[]>([])
const statistics = ref<any[]>([])
const matchId = ref('')

async function loadData() {
  standings.value = await getManagedStandings()
  statistics.value = await getManagedStatistics(matchId.value ? { matchId: matchId.value } : {})
}

onMounted(loadData)
</script>

<template>
  <div class="page-shell">
    <div class="container">
      <section class="content-panel" v-if="match">
        <router-link to="/manage/matches" class="pill">返回比赛目录</router-link>
        <h2 style="margin-top: 16px;">{{ match.homeTeamName }} vs {{ match.awayTeamName }}</h2>
        <p>{{ match.matchDate || '无日期' }} {{ match.matchTime || '' }} / {{ match.venue || '场馆待定' }}</p>

        <div class="stat-grid" style="margin-top: 20px;">
          <article class="stat-card">
            <h3>比分</h3>
            <strong>{{ match.homeScore }} : {{ match.awayScore }}</strong>
          </article>
          <article class="stat-card">
            <h3>赛事类型</h3>
            <strong>{{ match.tournamentType }}</strong>
          </article>
          <article class="stat-card">
            <h3>状态</h3>
            <strong>{{ match.status }}</strong>
          </article>
        </div>

        <h3 style="margin-top: 28px;">技术统计 Top 5</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>球员</th>
              <th>球队</th>
              <th>得分</th>
              <th>篮板</th>
              <th>助攻</th>
              <th>效率值</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in match.topPerformers" :key="item.id">
              <td>{{ item.playerName }}</td>
              <td>{{ item.teamName }}</td>
              <td>{{ item.points }}</td>
              <td>{{ item.rebounds }}</td>
              <td>{{ item.assists }}</td>
              <td>{{ item.efficiency }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getManagedMatch } from '@/services/api'

const route = useRoute()
const match = ref<any | null>(null)

onMounted(async () => {
  match.value = await getManagedMatch(String(route.params.matchId))
})
</script>

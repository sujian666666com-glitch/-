<template>
  <div class="page-shell">
    <div class="library-shell container">
      <aside class="library-sidebar">
        <h1>比赛目录</h1>
        <p>按比赛编号、队伍、场馆快速检索历史比赛与成绩结果。</p>
        <nav class="library-nav">
          <router-link to="/manage">总览</router-link>
          <router-link to="/manage/matches">比赛目录</router-link>
          <router-link to="/manage/matches/new">录入成绩</router-link>
          <router-link to="/manage/teams">球队与球员</router-link>
          <router-link to="/manage/statistics">积分榜与统计</router-link>
        </nav>
      </aside>

      <section class="content-panel">
        <h2>比赛目录</h2>
        <div class="toolbar">
          <input v-model="query" placeholder="搜索比赛、队伍、场馆" />
          <button class="btn btn-primary" @click="loadMatches">查询</button>
          <router-link class="btn btn-success" to="/manage/matches/new">录入成绩</router-link>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>编号</th>
              <th>赛事</th>
              <th>对阵</th>
              <th>比分</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="match in matches" :key="match.id">
              <td>{{ match.id }}</td>
              <td>{{ match.tournamentType }}</td>
              <td>{{ match.homeTeamName }} vs {{ match.awayTeamName }}</td>
              <td>{{ match.homeScore }} : {{ match.awayScore }}</td>
              <td><span class="pill">{{ match.status }}</span></td>
              <td>
                <router-link class="btn btn-primary" :to="`/manage/matches/${match.id}`">详情</router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getManagedMatches } from '@/services/api'

const matches = ref<any[]>([])
const query = ref('')

async function loadMatches() {
  matches.value = await getManagedMatches(query.value ? { query: query.value } : {})
}

onMounted(loadMatches)
</script>

<template>
  <div class="page-shell">
    <div class="library-shell container">
      <aside class="library-sidebar">
        <h1>球类成绩库</h1>
        <p>以图书馆编目方式管理比赛、球队、球员、积分榜与技术统计。</p>
        <nav class="library-nav">
          <router-link to="/manage">总览</router-link>
          <router-link to="/manage/matches">比赛目录</router-link>
          <router-link to="/manage/matches/new">录入成绩</router-link>
          <router-link to="/manage/teams">球队与球员</router-link>
          <router-link to="/manage/statistics">积分榜与统计</router-link>
          <router-link to="/">返回计分入口</router-link>
        </nav>
      </aside>

      <section class="content-panel">
        <h2>系统总览</h2>
        <p>管理端优先读取 `backend/data/brsms.db`，缺失内容回退到 CSV 文件。</p>

        <div class="stat-grid" v-if="metadata">
          <article class="stat-card">
            <h3>比赛记录</h3>
            <strong>{{ metadata.counts.matches }}</strong>
          </article>
          <article class="stat-card">
            <h3>球队档案</h3>
            <strong>{{ metadata.counts.teams }}</strong>
          </article>
          <article class="stat-card">
            <h3>球员档案</h3>
            <strong>{{ metadata.counts.players }}</strong>
          </article>
          <article class="stat-card">
            <h3>技术统计</h3>
            <strong>{{ metadata.counts.statistics }}</strong>
          </article>
        </div>

        <div v-if="metadata" style="margin-top: 24px;">
          <h3>最小必需字段</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>数据类型</th>
                <th>字段</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(fields, key) in metadata.minimumFields" :key="key">
                <td>{{ key }}</td>
                <td>{{ fields.join('、') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getManagementMetadata } from '@/services/api'

const metadata = ref<any | null>(null)

onMounted(async () => {
  metadata.value = await getManagementMetadata()
})
</script>

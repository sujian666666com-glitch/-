<template>
  <div class="page-shell">
    <div class="library-shell container">
      <aside class="library-sidebar">
        <h1>录入成绩</h1>
        <p>录入已结束或待确认比赛的基础比分，并补充球员关键技术统计。</p>
        <nav class="library-nav">
          <router-link to="/manage">总览</router-link>
          <router-link to="/manage/matches">比赛目录</router-link>
          <router-link to="/manage/matches/new">录入成绩</router-link>
          <router-link to="/manage/teams">球队与球员</router-link>
          <router-link to="/manage/statistics">积分榜与统计</router-link>
        </nav>
      </aside>

      <section class="content-panel">
        <h2>比赛基础信息</h2>
        <form class="entry-form" @submit.prevent="submitMatch">
          <div class="form-grid">
            <label>
              <span>赛事类型</span>
              <input v-model.trim="form.tournamentType" required placeholder="如 联赛 / 锦标赛" />
            </label>
            <label>
              <span>比赛日期</span>
              <input v-model="form.matchDate" type="date" />
            </label>
            <label>
              <span>场馆</span>
              <input v-model.trim="form.venue" placeholder="如 体育馆A" />
            </label>
            <label>
              <span>状态</span>
              <select v-model="form.status">
                <option value="已结束">已结束</option>
                <option value="未开始">未开始</option>
                <option value="进行中">进行中</option>
                <option value="待确认">待确认</option>
              </select>
            </label>
            <label class="team-field">
              <span>主队</span>
              <div class="team-input-stack">
                <select v-model="homeTeamInputMode" @change="resetTeamInput('home')">
                  <option value="existing">选择已有球队</option>
                  <option value="custom">自定义球队名称</option>
                </select>
                <select v-if="homeTeamInputMode === 'existing'" v-model="form.homeTeamId" required>
                  <option value="">请选择主队</option>
                  <option v-for="team in teams" :key="team.id" :value="team.id">{{ team.name }}</option>
                </select>
                <input v-else v-model.trim="form.homeTeamName" required placeholder="输入主队名称" />
              </div>
            </label>
            <label class="team-field">
              <span>客队</span>
              <div class="team-input-stack">
                <select v-model="awayTeamInputMode" @change="resetTeamInput('away')">
                  <option value="existing">选择已有球队</option>
                  <option value="custom">自定义球队名称</option>
                </select>
                <select v-if="awayTeamInputMode === 'existing'" v-model="form.awayTeamId" required>
                  <option value="">请选择客队</option>
                  <option v-for="team in teams" :key="team.id" :value="team.id">{{ team.name }}</option>
                </select>
                <input v-else v-model.trim="form.awayTeamName" required placeholder="输入客队名称" />
              </div>
            </label>
            <label>
              <span>主队得分</span>
              <input v-model.number="form.homeScore" min="0" required type="number" />
            </label>
            <label>
              <span>客队得分</span>
              <input v-model.number="form.awayScore" min="0" required type="number" />
            </label>
          </div>

          <div class="section-heading">
            <h2>球员技术统计</h2>
            <button class="btn btn-primary" type="button" @click="addStatRow">添加球员</button>
          </div>

          <table class="data-table entry-table" v-if="statRows.length > 0">
            <thead>
              <tr>
                <th>球队</th>
                <th>球员</th>
                <th>得分</th>
                <th>篮板</th>
                <th>助攻</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in statRows" :key="row.localId">
                <td>
                  <select v-model="row.teamId" @change="row.playerId = ''">
                    <option value="">选择球队</option>
                    <option v-for="team in selectedTeams" :key="team.id" :value="team.id">
                      {{ team.name }}
                    </option>
                  </select>
                </td>
                <td>
                  <select v-model="row.playerId">
                    <option value="">选择球员</option>
                    <option v-for="player in playersForTeam(row.teamId)" :key="player.id" :value="player.id">
                      {{ player.name }}
                    </option>
                  </select>
                </td>
                <td><input v-model.number="row.points" min="0" type="number" /></td>
                <td><input v-model.number="row.rebounds" min="0" type="number" /></td>
                <td><input v-model.number="row.assists" min="0" type="number" /></td>
                <td>
                  <button class="btn btn-danger" type="button" @click="removeStatRow(row.localId)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="empty-note">可以先不录入球员统计，后续只保存比赛基础成绩。</p>

          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

          <div class="form-actions">
            <button class="btn btn-success" type="submit" :disabled="submitting">
              {{ submitting ? '保存中...' : '保存成绩' }}
            </button>
            <router-link class="btn btn-primary" to="/manage/matches">返回比赛目录</router-link>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createManagedMatch, getManagedPlayers, getManagedTeams } from '@/services/api'

type Team = {
  id: string
  name: string
}

type Player = {
  id: string
  name: string
  teamId: string
}

type StatRow = {
  localId: number
  teamId: string
  playerId: string
  points: number
  rebounds: number
  assists: number
}

type TeamInputMode = 'existing' | 'custom'
type TeamSide = 'home' | 'away'

const router = useRouter()
const teams = ref<Team[]>([])
const players = ref<Player[]>([])
const statRows = ref<StatRow[]>([])
const submitting = ref(false)
const errorMessage = ref('')
const homeTeamInputMode = ref<TeamInputMode>('existing')
const awayTeamInputMode = ref<TeamInputMode>('existing')
let nextRowId = 1

const form = reactive({
  tournamentType: '联赛',
  matchDate: new Date().toISOString().slice(0, 10),
  venue: '',
  homeTeamId: '',
  homeTeamName: '',
  awayTeamId: '',
  awayTeamName: '',
  homeScore: 0,
  awayScore: 0,
  status: '已结束'
})

const selectedTeams = computed(() =>
  teams.value.filter((team) => team.id === form.homeTeamId || team.id === form.awayTeamId)
)

onMounted(async () => {
  const [teamRows, playerRows] = await Promise.all([getManagedTeams(), getManagedPlayers()])
  teams.value = teamRows
  players.value = playerRows
  form.homeTeamId = defaultExistingTeamId('home')
  form.awayTeamId = defaultExistingTeamId('away')
})

function playersForTeam(teamId: string) {
  return players.value.filter((player) => player.teamId === teamId)
}

function normalizeTeamName(name: string) {
  return name.trim().replace(/\s+/g, ' ')
}

function defaultExistingTeamId(side: TeamSide) {
  if (side === 'away') {
    return teams.value.find((team) => team.id !== form.homeTeamId)?.id ?? teams.value[0]?.id ?? ''
  }
  return teams.value[0]?.id ?? ''
}

function resetTeamInput(side: TeamSide) {
  if (side === 'home') {
    form.homeTeamId = homeTeamInputMode.value === 'existing' ? defaultExistingTeamId('home') : ''
    form.homeTeamName = ''
    return
  }
  form.awayTeamId = awayTeamInputMode.value === 'existing' ? defaultExistingTeamId('away') : ''
  form.awayTeamName = ''
}

function addStatRow() {
  statRows.value.push({
    localId: nextRowId,
    teamId: form.homeTeamId,
    playerId: '',
    points: 0,
    rebounds: 0,
    assists: 0
  })
  nextRowId += 1
}

function removeStatRow(localId: number) {
  statRows.value = statRows.value.filter((row) => row.localId !== localId)
}

function validateForm() {
  const homeTeamName = normalizeTeamName(form.homeTeamName)
  const awayTeamName = normalizeTeamName(form.awayTeamName)
  const homeTeamMissing = homeTeamInputMode.value === 'existing' ? !form.homeTeamId : !homeTeamName
  const awayTeamMissing = awayTeamInputMode.value === 'existing' ? !form.awayTeamId : !awayTeamName

  if (homeTeamMissing || awayTeamMissing) {
    return '请选择或填写主队和客队'
  }
  if (
    homeTeamInputMode.value === 'existing' &&
    awayTeamInputMode.value === 'existing' &&
    form.homeTeamId === form.awayTeamId
  ) {
    return '主队和客队不能相同'
  }
  if (
    homeTeamInputMode.value === 'custom' &&
    awayTeamInputMode.value === 'custom' &&
    homeTeamName === awayTeamName
  ) {
    return '主队和客队不能相同'
  }
  const incompleteRow = statRows.value.find((row) => !row.teamId || !row.playerId)
  if (incompleteRow) {
    return '技术统计行需要选择球队和球员'
  }
  return ''
}

async function submitMatch() {
  errorMessage.value = validateForm()
  if (errorMessage.value) {
    return
  }

  submitting.value = true
  try {
    const match = await createManagedMatch({
      tournamentType: form.tournamentType,
      matchDate: form.matchDate,
      venue: form.venue,
      homeTeamId: homeTeamInputMode.value === 'existing' ? form.homeTeamId : '',
      homeTeamName: homeTeamInputMode.value === 'custom' ? form.homeTeamName : '',
      awayTeamId: awayTeamInputMode.value === 'existing' ? form.awayTeamId : '',
      awayTeamName: awayTeamInputMode.value === 'custom' ? form.awayTeamName : '',
      homeScore: form.homeScore,
      awayScore: form.awayScore,
      status: form.status,
      statistics: statRows.value.map(({ teamId, playerId, points, rebounds, assists }) => ({
        teamId,
        playerId,
        points,
        rebounds,
        assists
      }))
    })
    await router.push(`/manage/matches/${match.id}`)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '保存成绩失败'
  } finally {
    submitting.value = false
  }
}
</script>

import { createRouter, createWebHistory } from 'vue-router'
import ScoreboardView from '@/views/ScoreboardView.vue'
import ControlView from '@/views/ControlView.vue'
import SetupView from '@/views/SetupView.vue'
import ManagementHomeView from '@/views/ManagementHomeView.vue'
import MatchManagementView from '@/views/MatchManagementView.vue'
import MatchEntryView from '@/views/MatchEntryView.vue'
import MatchDetailView from '@/views/MatchDetailView.vue'
import TeamPlayerManagementView from '@/views/TeamPlayerManagementView.vue'
import StatisticsView from '@/views/StatisticsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'setup', component: SetupView },
    { path: '/manage', name: 'manage-home', component: ManagementHomeView },
    { path: '/manage/matches', name: 'manage-matches', component: MatchManagementView },
    { path: '/manage/matches/new', name: 'manage-match-new', component: MatchEntryView },
    { path: '/manage/matches/:matchId/edit', name: 'manage-match-edit', component: MatchEntryView },
    { path: '/manage/matches/:matchId', name: 'manage-match-detail', component: MatchDetailView },
    { path: '/manage/teams', name: 'manage-teams', component: TeamPlayerManagementView },
    { path: '/manage/statistics', name: 'manage-statistics', component: StatisticsView },
    { path: '/scoreboard/:matchId', name: 'scoreboard', component: ScoreboardView },
    { path: '/control/:matchId', name: 'control', component: ControlView }
  ]
})

export default router

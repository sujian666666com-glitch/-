import { createRouter, createWebHistory } from 'vue-router'
import ScoreboardView from '@/views/ScoreboardView.vue'
import ControlView from '@/views/ControlView.vue'
import SetupView from '@/views/SetupView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'setup', component: SetupView },
    { path: '/scoreboard/:matchId', name: 'scoreboard', component: ScoreboardView },
    { path: '/control/:matchId', name: 'control', component: ControlView }
  ]
})

export default router
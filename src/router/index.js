import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import HomeDashboard from '../views/HomeDashboard.vue'
import ScanPage from '../views/ScanPage.vue'
import LoginSettings from '../views/LoginSettings.vue'
import DiaryLog from '../views/DiaryLog.vue' 

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeDashboard
    },
    {
      path: '/scan',
      name: 'scan',
      component: ScanPage
    },
    {
      path: '/settings',
      name: 'settings',
      component: LoginSettings
    },
    // 2. 加入這段設定
    {
      path: '/log',
      name: 'log',
      component: DiaryLog
    }
  ]
})


// 全域導航守衛 (Navigation Guard)
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 如果要去的地方不是設定頁，且使用者還沒登入 (沒 Key)
  if (to.name !== 'settings' && !userStore.isLoggedIn) {
    next({ name: 'settings' }) // 強制導向設定頁
  } else {
    next() // 放行
  }
})

export default router
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import MainLayout from '../views/MainLayout.vue'
import ScanPage from '../views/ScanPage.vue'
import LoginSettings from '../views/LoginSettings.vue'
import CustomFoodSettings from '../views/CustomFoodSettings.vue'
import ChangelogPage from '../views/ChangelogPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: MainLayout
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
    {
      path: '/custom-food',
      name: 'custom-food',
      component: CustomFoodSettings
    },
    {
      path: '/changelog',
      name: 'changelog',
      component: ChangelogPage
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
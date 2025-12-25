<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/userStore'
import { APP_VERSION } from '../stores/changelog'
import Navbar from '../components/UI/Navbar.vue'
import HomeDashboard from './HomeDashboard.vue'
import Quests from './Quests.vue'
import Diary from './Diary.vue'
import Setting from './Setting.vue'
import UpdateModal from '../components/UI/UpdateModal.vue'

const userStore = useUserStore()
const activeTab = ref('dashboard')
const showUpdate = ref(false)

onMounted(() => {
  // 檢查版本號，若不同則顯示更新視窗
  if (userStore.settings.lastSeenVersion !== APP_VERSION) {
    showUpdate.value = true
  }
})

const closeUpdateModal = () => {
  showUpdate.value = false
  userStore.settings.lastSeenVersion = APP_VERSION // 更新已讀版本
}
</script>

<template>
  <div class="h-screen text-white bg-gray-900">
    <!-- 全局容器：固定高度，限制最大寬度並置中 -->
    <div class="flex flex-col w-full h-full max-w-xl mx-auto overflow-hidden bg-gray-900 shadow-2xl">
      <!-- 主要內容區塊 (負責內部捲動) -->
      <main class="relative flex-1 overflow-x-hidden overflow-y-auto scroll-smooth">
        <HomeDashboard v-if="activeTab === 'dashboard'" />
        <Quests v-if="activeTab === 'quests'" />
        <Diary v-if="activeTab === 'diary'" />
        <Setting v-if="activeTab === 'more'" />
      </main>
      
      <!-- 底部導航列 (Flex 佈局自然置底，無需 Sticky) -->
      <Navbar v-model:activeTab="activeTab" />

      <!-- 版本更新通知 -->
      <UpdateModal v-if="showUpdate" @close="closeUpdateModal" />
    </div>
  </div>
</template>

<style scoped>
/* 美化捲軸 (Chrome/Safari/Edge) */
main::-webkit-scrollbar {
  width: 6px;
}
main::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
main::-webkit-scrollbar-track {
  background: transparent;
}
</style>
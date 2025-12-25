<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps(['activeTab'])
const emit = defineEmits(['update:activeTab'])

const goToScan = () => {
  router.push('/scan')
}
</script>

<template>
  <div class="z-50 flex items-center justify-around flex-none w-full h-16 bg-gray-800 border-t border-gray-700">
    <!-- 1. 儀表板 -->
    <button @click="emit('update:activeTab', 'dashboard')" :class="{ 'active text-blue-400 border-t-2 border-blue-400': activeTab === 'dashboard', 'text-gray-400': activeTab !== 'dashboard' }">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
      <span class="text-xs btm-nav-label">儀表板</span>
    </button>

    <!-- 2. 每日任務 -->
    <button @click="emit('update:activeTab', 'quests')" :class="{ 'active text-yellow-400 border-t-2 border-yellow-400': activeTab === 'quests', 'text-gray-400': activeTab !== 'quests' }">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
      <span class="text-xs btm-nav-label">任務</span>
    </button>

    <!-- 3. 新增 (突出顯示) -->
    <div class="relative flex items-center justify-center flex-1 pointer-events-none">
      <button @click="goToScan" class="grid -mt-8 text-white border-4 border-gray-900 rounded-full shadow-lg pointer-events-auto w-14 h-14 bg-gradient-to-br from-green-500 to-blue-600 place-content-center">
        <span class="text-4xl font-bold material-symbols-outlined">add</span>
      </button>
    </div>

    <!-- 4. 日記 -->
    <button @click="emit('update:activeTab', 'diary')" :class="{ 'active text-green-400 border-t-2 border-green-400': activeTab === 'diary', 'text-gray-400': activeTab !== 'diary' }">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
      <span class="text-xs btm-nav-label">日記</span>
    </button>

    <!-- 5. 更多 -->
    <button @click="emit('update:activeTab', 'more')" :class="{ 'active text-purple-400 border-t-2 border-purple-400': activeTab === 'more', 'text-gray-400': activeTab !== 'more' }">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
      <span class="text-xs btm-nav-label">更多</span>
    </button>
  </div>
</template>

<style scoped>
/* 補回 btm-nav 的按鈕樣式 */
button {
  @apply flex flex-col items-center justify-center flex-1 h-full cursor-pointer bg-transparent border-none;
}

/* 確保 active 狀態下的邊框位置正確 */
button.active {
  @apply bg-gray-800;
}
</style>
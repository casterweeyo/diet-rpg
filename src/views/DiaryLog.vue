<script setup>
import { useRouter } from 'vue-router'
import { useDiaryStore } from '../stores/diaryStore'

const router = useRouter()
const diaryStore = useDiaryStore()

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleDelete = (id) => {
  if (confirm('確定要刪除這筆紀錄嗎？經驗值不會被扣除，但熱量統計會更新。')) {
    diaryStore.removeLog(id)
  }
}
</script>

<template>
  <div class="max-w-xl min-h-screen p-6 pb-24 mx-auto text-white bg-gray-900">
    
    <!-- Header -->
    <header class="flex items-center gap-4 mb-8">
      <button @click="router.back()" class="btn btn-circle btn-ghost btn-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <h1 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
        飲控日誌
      </h1>
    </header>

    <!-- Empty State -->
    <div v-if="diaryStore.recentLogs.length === 0" class="flex flex-col items-center justify-center mt-20 text-gray-500">
      <div class="mb-4 text-6xl">📜</div>
      <p>日誌是空的...</p>
      <p class="text-sm">快去掃描食物，寫下你的冒險故事！</p>
    </div>

    <!-- Log List -->
    <div v-else class="space-y-4">
      <div 
        v-for="log in diaryStore.recentLogs" 
        :key="log.id" 
        class="relative p-4 transition-all border border-gray-700 shadow-lg bg-gray-800/80 rounded-xl hover:bg-gray-800"
      >
        <!-- Delete Button -->
        <button 
          @click="handleDelete(log.id)"
          class="absolute text-gray-600 top-3 right-3 hover:text-red-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        <div class="flex items-start justify-between mb-2">
          <div>
            <h3 class="text-lg font-bold text-white">{{ log.food_name }}</h3>
            <span class="text-xs text-gray-400">{{ formatDate(log.timestamp) }}</span>
          </div>
          <div class="mr-8 text-right">
            <span class="text-2xl font-black text-green-400">{{ log.calories }}</span>
            <span class="text-xs text-gray-500"> kcal</span>
          </div>
        </div>

        <!-- Macros Mini Bar -->
        <div class="flex gap-2 mt-3 text-xs">
          <span class="px-2 py-1 text-blue-300 rounded bg-blue-900/30">蛋白質 {{ log.protein }}g</span>
          <span class="px-2 py-1 text-orange-300 rounded bg-orange-900/30">碳水 {{ log.carbs }}g</span>
          <span class="px-2 py-1 text-red-300 rounded bg-red-900/30">脂肪 {{ log.fat }}g</span>
        </div>

        <p class="pl-2 mt-3 text-xs italic text-gray-500 border-l-2 border-gray-600">"{{ log.advice }}"</p>
      </div>
    </div>

  </div>
</template>
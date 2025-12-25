<script setup>
import { useRouter } from 'vue-router'
import { CHANGELOG } from '../stores/changelog'

const router = useRouter()

const handleClose = () => {
  router.push('/settings') // 返回設定頁
}
</script>

<template>
  <div class="max-w-xl min-h-screen p-4 mx-auto text-white bg-gray-900">
    <div class="relative w-full p-6 bg-gray-800 border border-gray-700 shadow-2xl rounded-xl min-h-[80vh]">
      
      <button @click="handleClose" class="absolute text-gray-400 top-4 right-4 hover:text-white">
        <span class="material-symbols-outlined">close</span>
      </button>
      
      <h1 class="mb-8 text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
        版本更新紀錄
      </h1>
      
      <div class="space-y-8">
        <div v-for="log in CHANGELOG" :key="log.version" class="relative pl-6 border-l-2 border-gray-700">
          <!-- Timeline Dot -->
          <div class="absolute w-4 h-4 bg-gray-900 border-2 border-green-500 rounded-full -left-[9px] top-0"></div>
          
          <div class="flex items-center gap-2 mb-1">
            <span class="text-lg font-bold text-white">v{{ log.version }}</span>
            <span class="text-xs text-gray-500 bg-gray-700 px-2 py-0.5 rounded-full">{{ log.date }}</span>
          </div>
          <h3 class="mb-3 text-sm font-medium text-green-400">{{ log.title }}</h3>
          
          <ul class="space-y-2">
            <li v-for="(feat, idx) in log.features" :key="idx" class="flex items-start gap-2 text-sm text-gray-300">
              <span class="mt-1.5 w-1 h-1 bg-gray-500 rounded-full shrink-0"></span>
              <span class="leading-relaxed">{{ feat }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
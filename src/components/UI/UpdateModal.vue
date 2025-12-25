<script setup>
import { computed } from 'vue'
import { CHANGELOG } from '../../stores/changelog'

const emit = defineEmits(['close'])

// 取得最新版本的更新內容
const latestUpdate = computed(() => CHANGELOG[0])
</script>

<template>
  <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
    <div class="w-full max-w-md overflow-hidden bg-gray-900 border border-gray-700 shadow-2xl rounded-2xl">
      
      <!-- Header -->
      <div class="relative p-6 overflow-hidden bg-gradient-to-br from-green-600 to-blue-700">
        <div class="absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 bg-white rounded-full opacity-10 blur-2xl"></div>
        <h2 class="text-2xl font-black text-white">版本更新 🎉</h2>
        <p class="text-green-100 opacity-90">v{{ latestUpdate.version }} - {{ latestUpdate.title }}</p>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-4">
        <div>
          <h3 class="mb-2 text-sm font-bold tracking-widest text-gray-400 uppercase">What's New</h3>
          <ul class="space-y-3">
            <li v-for="(feature, index) in latestUpdate.features" :key="index" class="flex items-start gap-3">
              <span class="mt-1 text-lg text-green-400 material-symbols-outlined">check_circle</span>
              <span class="text-sm leading-relaxed text-gray-200">{{ feature }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-700 bg-gray-800/50">
        <button @click="emit('close')" class="w-full py-3 font-bold text-white transition-all bg-green-600 shadow-lg rounded-xl hover:bg-green-500 active:scale-95 shadow-green-900/20">
          太棒了！我知道了
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
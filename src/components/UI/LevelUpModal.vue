<script setup>
import { useUserStore } from '../../stores/userStore'
const userStore = useUserStore()
</script>

<template>
  <div v-if="userStore.showLevelUpModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in">
    
    <!-- 背景光效 -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/20 rounded-full blur-[100px] animate-pulse"></div>
    </div>

    <div class="relative z-10 text-center transform transition-all">
      <h2 class="text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-400 to-red-500 drop-shadow-lg animate-bounce-in">
        LEVEL UP!
      </h2>
      
      <div class="relative flex items-center justify-center my-8">
        <!-- 裝飾圈圈 -->
        <div class="absolute w-40 h-40 border-4 border-yellow-500/30 rounded-full animate-spin-slow"></div>
        <div class="absolute w-32 h-32 border-2 border-yellow-300/50 rounded-full animate-reverse-spin"></div>
        
        <div class="text-9xl font-black text-white drop-shadow-[0_0_25px_rgba(234,179,8,0.8)] animate-scale-up">
          {{ userStore.game.level }}
        </div>
      </div>

      <p class="text-2xl font-bold text-yellow-100 mb-8 animate-slide-up">
        恭喜！你變得更強了！
      </p>

      <button 
        @click="userStore.closeLevelUpModal" 
        class="btn btn-lg border-none bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-black text-xl px-12 rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(234,179,8,0.6)] transition-all animate-pulse-slow"
      >
        繼續冒險
      </button>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
.animate-bounce-in { animation: bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
.animate-scale-up { animation: scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s both; }
.animate-slide-up { animation: slideUp 0.5s ease-out 0.4s both; }
.animate-spin-slow { animation: spin 8s linear infinite; }
.animate-reverse-spin { animation: spin 6s linear infinite reverse; }
.animate-pulse-slow { animation: pulse 2s infinite; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes bounceIn { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
@keyframes scaleUp { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
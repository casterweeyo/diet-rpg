<script setup>
import { computed } from 'vue'
import { useUserStore } from '../stores/userStore'
import { useDiaryStore } from '../stores/diaryStore'

const userStore = useUserStore()
const diaryStore = useDiaryStore()

const handleAddWater = (amount) => {
  userStore.addWater(amount)
}

const maxDroplets = 10
const waterDroplets = computed(() => {
  return Math.floor((userStore.game.waterIntake / userStore.waterGoal) * maxDroplets);
});

const remainingCalories = computed(() => {
  const target = userStore.dailyTargets?.calories || 0
  let consumed = diaryStore.todaySummary?.calories || 0
  if (userStore.settings?.roundUpCalories) consumed = Math.ceil(consumed)
  return target - consumed
})

const calorieProgress = computed(() => {
  const target = userStore.dailyTargets?.calories || 1
  let consumed = diaryStore.todaySummary?.calories || 0
  if (userStore.settings?.roundUpCalories) consumed = Math.ceil(consumed)
  return Math.min(100, (consumed / target) * 100)
})

const macroStats = computed(() => {
  const s = diaryStore.todaySummary || {}
  const t = userStore.dailyTargets || {}
  
  return [
    { label: '蛋白質', val: s.protein || 0, max: t.protein || 1, color: 'bg-blue-500', textColor: 'text-blue-400' },
    { label: '碳水', val: s.carbs || 0, max: t.carbs || 1, color: 'bg-orange-500', textColor: 'text-orange-400' },
    { label: '脂肪', val: s.fat || 0, max: t.fat || 1, color: 'bg-red-500', textColor: 'text-red-400' }
  ]
})
</script>

<template>
  <div class="flex flex-col gap-6 p-4 animate-fade-in">
    <!-- Hero Stats Card -->
    <div class="relative w-full p-5 overflow-hidden border rounded-xl bg-gradient-to-br from-surface-card to-surface-dark border-white/5 group">
      <div class="absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 rounded-full pointer-events-none bg-primary/10 blur-3xl"></div>
      <div class="relative z-10 flex flex-col gap-4">
        
        <!-- User Info Header -->
        <div class="flex items-center gap-4">
          <div class="flex items-center justify-center w-16 h-16 bg-gray-800 border-2 border-gray-600 rounded-full shadow-lg">
            <span class="text-4xl text-gray-300 material-symbols-outlined">person</span>
          </div>
          <div class="flex-1">
            <h2 class="text-xl font-bold text-white">{{ userStore.profile?.name || '冒險者' }}</h2>
            <div class="flex items-center gap-2 mt-1">
              <span class="px-2 py-0.5 text-xs font-bold text-black bg-yellow-500 rounded">Lv.{{ userStore.game.level }}</span>
              <span class="text-sm text-gray-400">戰士 (Warrior)</span>
            </div>
          </div>
        </div>

        <!-- EXP Bar -->
        <div class="flex flex-col gap-1.5 mt-2">
          <div class="flex justify-between text-xs font-medium text-gray-400">
            <span>EXP</span>
            <span>{{ userStore.game.currentXP }} / {{ userStore.nextLevelXP }}</span>
          </div>
          <div class="w-full h-3 overflow-hidden border rounded-full bg-black/40 border-white/5">
            <div class="h-full transition-all duration-1000 ease-out rounded-full bg-primary shadow-[0_0_10px_rgba(19,236,91,0.5)]" :style="{ width: `${userStore.xpProgress}%` }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Calories Widget -->
    <section>
      <div class="flex items-center justify-between px-1 mb-3">
        <h3 class="flex items-center gap-2 text-lg font-bold text-white">
          <span class="text-green-400 material-symbols-outlined">local_fire_department</span>
          熱量 (Calories)
        </h3>
        <span class="px-2 py-1 text-xs font-medium text-green-300 border rounded-lg bg-green-500/10 border-green-500/20">目標: {{ userStore.dailyTargets?.calories || 0 }}</span>
      </div>
      <div class="p-4 border rounded-xl bg-surface-dark border-white/5">
        <div class="flex items-end justify-between mb-2">
          <div>
            <span class="text-3xl font-bold" :class="remainingCalories < 0 ? 'text-red-400' : 'text-white'">{{ remainingCalories }}</span>
            <span class="ml-1 text-sm text-gray-400">剩餘 kcal</span>
          </div>
          <div class="text-right">
            <span class="text-sm text-gray-400">已攝取 {{ userStore.settings?.roundUpCalories ? Math.ceil(diaryStore.todaySummary?.calories || 0) : (diaryStore.todaySummary?.calories || 0) }}</span>
          </div>
        </div>
        <div class="w-full h-2 overflow-hidden bg-gray-700 rounded-full">
          <div class="h-full transition-all duration-1000 ease-out rounded-full" :class="remainingCalories < 0 ? 'bg-red-500' : 'bg-green-500'" :style="{ width: `${calorieProgress}%` }"></div>
        </div>
      </div>
    </section>

    <!-- Macros Widget -->
    <section>
      <div class="grid grid-cols-3 gap-3">
        <div v-for="stat in macroStats" :key="stat.label" class="p-3 border rounded-xl bg-surface-dark border-white/5">
          <div class="mb-2 text-xs font-bold" :class="stat.textColor">{{ stat.label }}</div>
          <div class="flex items-end gap-1 mb-2">
            <span class="text-xl font-bold text-white">{{ Math.round(stat.val) }}</span>
            <span class="text-xs text-gray-500">/ {{ Math.round(stat.max) }}g</span>
          </div>
          <div class="w-full h-1.5 overflow-hidden bg-gray-700 rounded-full">
            <div class="h-full transition-all duration-1000 rounded-full" :class="stat.color" :style="{ width: `${Math.min(100, (stat.val / stat.max) * 100)}%` }"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- water Widget -->
    <section>
      <div class="flex items-center justify-between px-1 mb-3">
        <h3 class="flex items-center gap-2 text-lg font-bold text-white">
          <span class="text-blue-400 material-symbols-outlined">water_drop</span>
          水份 (Water)
        </h3>
        <span class="px-2 py-1 text-xs font-medium text-blue-300 border rounded-lg bg-blue-500/10 border-blue-500/20">目標: {{ userStore.waterGoal }}ml</span>
      </div>
      <div class="flex items-center justify-between gap-4 p-4 border rounded-xl bg-surface-dark border-white/5">
        <div class="flex-1">
          <div class="flex items-baseline gap-1 mb-2">
            <span class="text-2xl font-bold text-white">{{ userStore.game.waterIntake }}</span>
            <span class="text-sm text-gray-400">ml</span>
          </div>
          <!-- Water droplets visualizer -->
          <div class="flex gap-1">
            <div v-for="i in maxDroplets" :key="i" class="w-5 h-8 transition-colors duration-500 border rounded-sm rounded-b-lg" :class="i <= waterDroplets ? 'bg-blue-500 border-blue-400/20 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-surface-card border-white/10'"></div>
          </div>
        </div>
        <button @click="handleAddWater(250)" class="flex items-center justify-center text-white transition-all bg-blue-600 rounded-full shadow-lg size-12 hover:bg-blue-500 active:scale-95 shadow-blue-900/20">
          <span class="material-symbols-outlined">add</span>
        </button>
      </div>
    </section>

    <!-- Daily Quests (Moved from Quests.vue) -->
    <section class="flex flex-col gap-3">
      <div class="flex items-center justify-between px-1">
        <h3 class="text-lg font-bold text-white">每日任務</h3>
      </div>
      <div v-for="quest in userStore.game.dailyQuests.items" :key="quest.id"
        class="relative flex items-center gap-4 p-4 overflow-hidden transition-all border rounded-xl bg-surface-dark border-white/5 hover:border-primary/30"
      >
        <div class="absolute top-0 bottom-0 left-0 w-1 transition-colors bg-primary/50 group-hover:bg-primary"></div>
        <div class="relative flex items-center justify-center">
          <span class="text-2xl material-symbols-outlined" :class="quest.completed ? 'text-primary' : 'text-gray-600'">
            {{ quest.completed ? 'check_circle' : 'radio_button_unchecked' }}
          </span>
        </div>
        <div class="flex flex-col flex-1">
          <span class="text-base font-semibold leading-tight text-white transition-colors group-hover:text-primary" :class="{ 'line-through text-gray-500': quest.completed }">{{ quest.title }}</span>
          <span class="text-sm text-gray-400">{{ quest.desc }}</span>
        </div>
        <div class="flex flex-col items-end justify-center min-w-[60px]">
            <span v-if="!quest.completed" class="px-2 py-1 text-xs font-bold rounded text-primary bg-primary/10">+{{ quest.xp }} XP</span>
            <span v-else class="px-2 py-1 text-xs font-bold text-gray-500 rounded bg-gray-500/10">Done</span>
        </div>
      </div>
    </section>
  </div>
</template>
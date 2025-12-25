<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/userStore'
import { useDiaryStore } from '../stores/diaryStore'
import CalorieChart from '../components/UI/CalorieChart.vue'
import WeightChart from '../components/UI/WeightChart.vue'

const diaryStore = useDiaryStore()
const userStore = useUserStore()

const chartPeriod = ref('week')

const targets = computed(() => userStore.dailyTargets)
const todayConsumed = computed(() => diaryStore.todaySummary)

const progress = computed(() => ({
  calories: Math.min(100, (todayConsumed.value.calories / targets.value.calories) * 100),
  protein: Math.min(100, (todayConsumed.value.protein / targets.value.protein) * 100),
  carbs: Math.min(100, (todayConsumed.value.carbs / targets.value.carbs) * 100),
  fat: Math.min(100, (todayConsumed.value.fat / targets.value.fat) * 100),
}))

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const translateMealType = (type) => {
  const map = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '宵夜' }
  return map[type] || '點心'
}

const handleRecordWeight = () => {
  const input = prompt("請輸入今天的體重 (kg):", userStore.profile.weight)
  if (input && !isNaN(input)) {
    userStore.recordWeight(input)
  }
}
</script>

<template>
  <div class="p-4 space-y-6 animate-fade-in">
    <section class="grid grid-cols-3 gap-4">
      <!-- Macros circles (Protein, Carbs, Fat) -->
      <!-- ... (Same as before, simplified for brevity) ... -->
    </section>
    
    <section class="p-6 bg-gray-800 border border-gray-700 shadow-xl rounded-2xl">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-bold tracking-widest text-gray-400 uppercase">熱量攝取趨勢</h3>
        <div class="flex p-1 bg-gray-900 rounded-lg">
          <button @click="chartPeriod = 'week'" class="px-3 py-1 text-xs font-bold transition-all rounded-md" :class="chartPeriod === 'week' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'">週</button>
          <button @click="chartPeriod = 'month'" class="px-3 py-1 text-xs font-bold transition-all rounded-md" :class="chartPeriod === 'month' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'">月</button>
        </div>
      </div>
      <CalorieChart :period="chartPeriod" />
    </section>

    <!-- Weight Chart (Moved from Setting) -->
    <section class="p-6 bg-gray-800 border border-gray-700 shadow-xl rounded-2xl">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-bold tracking-widest text-gray-400 uppercase">體重趨勢 (Weight)</h3>
        <button @click="handleRecordWeight" class="px-3 py-1 text-xs font-bold text-white transition bg-blue-600 rounded-full hover:bg-blue-500">
          + 紀錄
        </button>
      </div>
      <WeightChart />
    </section>

  </div>
</template>
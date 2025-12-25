<script setup>
import { ref, computed } from 'vue'
import { useDiaryStore } from '../stores/diaryStore'
import { useUserStore } from '../stores/userStore'

const diaryStore = useDiaryStore()
const userStore = useUserStore()

const dateOffset = ref(0)

const currentDate = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + dateOffset.value)
  return d
})

const dateLabel = computed(() => {
  if (dateOffset.value === 0) return '今天'
  if (dateOffset.value === -1) return '昨天'
  if (dateOffset.value === 1) return '明天'
  return currentDate.value.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })
})

const changeDate = (delta) => {
  dateOffset.value += delta
}

// 取得當日紀錄
const dailyLogs = computed(() => {
  const targetDateStr = currentDate.value.toDateString()
  return (diaryStore.logs || []).filter(log => {
    const logDate = new Date(log.timestamp)
    return logDate.toDateString() === targetDateStr
  })
})

// 分類
const categories = computed(() => {
  const groups = {
    breakfast: { label: '早餐', items: [], total: 0 },
    lunch: { label: '午餐', items: [], total: 0 },
    dinner: { label: '晚餐', items: [], total: 0 },
    snack: { label: '點心', items: [], total: 0 }
  }

  dailyLogs.value.forEach(log => {
    const type = log.mealType || 'snack'
    if (groups[type]) {
      groups[type].items.push(log)
      const cals = userStore.settings?.roundUpCalories ? Math.ceil(log.calories || 0) : (log.calories || 0)
      groups[type].total += cals
    }
  })
  
  return groups
})

const waterIntake = computed(() => {
  // 僅顯示當日水分 (若需歷史紀錄需擴充 Store)
  return dateOffset.value === 0 ? userStore.game.waterIntake : 0
})

const handleDeleteLog = (id) => {
  if (confirm('確定要刪除這筆紀錄嗎？')) {
    diaryStore.removeLog(id)
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 p-4 animate-fade-in">
    <!-- 日期選擇器 -->
    <div class="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-xl">
      <button @click="changeDate(-1)" class="p-2 text-gray-400 hover:text-white">
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
      <span class="text-lg font-bold text-white">{{ dateLabel }}</span>
      <button @click="changeDate(1)" class="p-2 text-gray-400 hover:text-white" :disabled="dateOffset >= 0">
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
    </div>

    <!-- 食物列表 -->
    <div v-for="(group, key) in categories" :key="key" class="overflow-hidden border bg-surface-dark border-white/5 rounded-xl">
      <div class="flex items-center justify-between px-4 py-3 bg-gray-800/50">
        <h3 class="font-bold text-gray-300">{{ group.label }}</h3>
        <span class="text-xs font-bold text-gray-500">{{ group.total }} kcal</span>
      </div>
      
      <div v-if="group.items.length === 0" class="p-4 text-sm text-center text-gray-600">
        尚無紀錄
      </div>
      
      <div v-else class="divide-y divide-gray-700/50">
        <div v-for="item in group.items" :key="item.id" class="flex items-center justify-between p-4 hover:bg-white/5">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-medium text-white">{{ item.food_name }}</span>
            </div>
            <div class="text-xs text-gray-500">{{ new Date(item.timestamp).toLocaleTimeString('zh-TW', {hour: '2-digit', minute:'2-digit'}) }}</div>
          </div>
          <div class="flex items-center gap-3">
            <div class="font-bold text-green-400">{{ userStore.settings?.roundUpCalories ? Math.ceil(item.calories) : item.calories }}</div>
            <button @click="handleDeleteLog(item.id)" class="text-gray-600 hover:text-red-400"><span class="text-lg material-symbols-outlined">delete</span></button>
          </div>
        </div>
      </div>
    </div>

    <!-- 水分 (獨立區塊) -->
    <div class="overflow-hidden border bg-surface-dark border-white/5 rounded-xl">
      <div class="flex items-center justify-between px-4 py-3 bg-gray-800/50">
        <h3 class="font-bold text-blue-300">水分</h3>
        <span class="text-xs font-bold text-gray-500">{{ waterIntake }} ml</span>
      </div>
      <div class="flex items-center gap-4 p-4">
        <div class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20">
          <span class="text-blue-400 material-symbols-outlined">water_drop</span>
        </div>
        <div class="flex-1">
          <div class="h-2 overflow-hidden bg-gray-700 rounded-full">
            <div class="h-full transition-all bg-blue-500" :style="{ width: Math.min(100, (waterIntake / userStore.waterGoal) * 100) + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
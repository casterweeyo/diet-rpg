<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { useDiaryStore } from '../stores/diaryStore'
import LevelUpModal from '../components/UI/LevelUpModal.vue'
import WeightChart from '../components/UI/WeightChart.vue'

const diaryStore = useDiaryStore()

const router = useRouter()
const userStore = useUserStore()

// 頁面狀態
const activeTab = ref('quests') // quests | water | diary | more

// 取得每日目標 (來自 userStore 的 TDEE 計算)
const targets = computed(() => userStore.dailyTargets)

// 用 computed 自動計算
const todayConsumed = computed(() => diaryStore.todaySummary)

// 計算進度百分比 (用於 CSS寬度)
const progress = computed(() => ({
  calories: Math.min(100, (todayConsumed.value.calories / targets.value.calories) * 100),
  protein: Math.min(100, (todayConsumed.value.protein / targets.value.protein) * 100),
  carbs: Math.min(100, (todayConsumed.value.carbs / targets.value.carbs) * 100),
  fat: Math.min(100, (todayConsumed.value.fat / targets.value.fat) * 100),
}))

// 初始化檢查
onMounted(() => {
  userStore.checkDailyReset()
  // 自動完成登入任務
  userStore.completeQuest('login')
})

// 監聽蛋白質是否達標
watch(() => todayConsumed.value.protein, (newVal) => {
  if (newVal >= targets.value.protein) {
    userStore.completeQuest('protein')
  }
})

// 導航到掃描頁
const goToScan = () => {
  router.push('/scan')
}

const goToSettings = () => {
  router.push('/settings') // 假設路由有設定這個
}

// 紀錄體重 (簡單版：使用 prompt)
const handleRecordWeight = () => {
  const input = prompt("請輸入今天的體重 (kg):", userStore.profile.weight)
  if (input && !isNaN(input)) {
    userStore.recordWeight(input)
  }
}

// 增加飲水
const handleAddWater = (amount) => {
  userStore.addWater(amount)
}

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleDeleteLog = (id) => {
  if (confirm('確定要刪除這筆紀錄嗎？經驗值不會被扣除，但熱量統計會更新。')) {
    diaryStore.removeLog(id)
  }
}
</script>

<template>
  <div class="relative max-w-xl min-h-screen pb-24 mx-auto overflow-hidden text-white bg-gray-900">
    
    <LevelUpModal />

    <header class="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800/50 backdrop-blur-md">
      <div class="flex items-center gap-3">
        <div class="flex items-center justify-center w-12 h-12 text-xl font-black border-2 border-yellow-200 rounded-full shadow-lg bg-gradient-to-br from-yellow-400 to-orange-600">
          {{ userStore.game.level }}
        </div>
        <div>
          <h2 class="text-lg font-bold leading-tight">{{ userStore.profile.name || '冒險者' }}</h2>
          <p class="font-mono text-xs text-green-400">
            Lv.{{ userStore.game.level }} Explorer
          </p>
        </div>
      </div>
      <!-- 顯示目前的 Tab 名稱 -->
      <div class="text-sm font-bold tracking-widest text-gray-400 uppercase">
        <span v-if="activeTab === 'quests'">每日任務</span>
        <span v-else-if="activeTab === 'water'">水分紀錄</span>
        <span v-else-if="activeTab === 'diary'">飲食日記</span>
        <span v-else-if="activeTab === 'more'">更多功能</span>
      </div>
    </header>

    <main class="p-6 space-y-8">
      
      <!-- Tab 1: 每日任務 (Quests) -->
      <div v-if="activeTab === 'quests'" class="space-y-8 animate-fade-in">
        <section>
        <div class="flex justify-between mb-1 text-xs text-gray-400">
          <span>EXP</span>
          <span>{{ userStore.game.currentXP }} / {{ userStore.nextLevelXP }}</span>
        </div>
        <div class="w-full h-4 overflow-hidden bg-gray-700 border border-gray-600 rounded-full shadow-inner">
          <div 
            class="bg-gradient-to-r from-yellow-500 to-yellow-300 h-4 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(234,179,8,0.5)]"
            :style="{ width: `${userStore.xpProgress}%` }"
          ></div>
        </div>
        </section>

        <section>
          <h3 class="flex items-center gap-2 mb-4 text-sm font-bold tracking-widest text-gray-400 uppercase">
            <span class="text-yellow-500">★</span> 每日任務
          </h3>
          <div class="space-y-3">
            <div v-for="quest in userStore.game.dailyQuests.items" :key="quest.id"
              class="flex items-center gap-3 p-3 transition-all bg-gray-800 border rounded-lg"
              :class="quest.completed ? 'border-green-500/30 bg-green-900/10' : 'border-gray-700'"
            >
              <div class="flex items-center justify-center w-6 h-6 rounded"
                :class="quest.completed ? 'bg-green-500 text-black' : 'border-2 border-gray-600'">
                <span v-if="quest.completed">✓</span>
              </div>
              <div class="flex-1">
                <h4 class="text-sm font-bold text-white" :class="{ 'line-through text-gray-500': quest.completed }">{{ quest.title }}</h4>
                <p class="text-xs text-gray-500">{{ quest.desc }}</p>
              </div>
              <span v-if="!quest.completed" class="text-xs font-bold text-yellow-400">+{{ quest.xp }} XP</span>
            </div>
          </div>
        </section>
      </div>

      <!-- Tab 2: 水分 (Water) -->
      <div v-if="activeTab === 'water'" class="space-y-8 animate-fade-in">
        <section class="relative p-6 overflow-hidden bg-gray-800 border border-gray-700 shadow-xl rounded-2xl">
          <div class="absolute w-32 h-32 rounded-full pointer-events-none -right-6 -bottom-6 bg-blue-500/20 blur-2xl"></div>
          
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold tracking-widest text-gray-400 uppercase">水分補給 (Water)</h3>
            <span class="font-mono text-xs text-blue-400">{{ userStore.game.waterIntake }} / {{ userStore.waterGoal }} ml</span>
          </div>

          <div class="w-full h-4 mb-4 overflow-hidden bg-gray-700 rounded-full">
            <div class="h-full transition-all duration-500 bg-blue-500" :style="{ width: `${Math.min(100, (userStore.game.waterIntake / userStore.waterGoal) * 100)}%` }"></div>
          </div>

          <div class="flex justify-between gap-2">
            <button @click="handleAddWater(250)" class="flex-1 text-blue-400 border-blue-500 btn btn-sm btn-outline hover:bg-blue-500 hover:text-white">+250ml</button>
            <button @click="handleAddWater(500)" class="flex-1 text-blue-400 border-blue-500 btn btn-sm btn-outline hover:bg-blue-500 hover:text-white">+500ml</button>
            <button @click="handleAddWater(700)" class="flex-1 text-blue-400 border-blue-500 btn btn-sm btn-outline hover:bg-blue-500 hover:text-white">+700ml</button>
          </div>
        </section>
      </div>

      <!-- Tab 3: 日記 (Diary) -->
      <div v-if="activeTab === 'diary'" class="space-y-6 animate-fade-in">
        <section class="relative p-6 overflow-hidden bg-gray-800 border border-gray-700 shadow-xl rounded-2xl">
        <div class="absolute w-32 h-32 rounded-full pointer-events-none -right-10 -top-10 bg-green-500/10 blur-2xl"></div>

        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-bold tracking-widest text-gray-400 uppercase">今日熱量(Calories)</h3>
        </div>
        
        <div class="flex items-end justify-between mb-2">
          <div>
            <span class="text-4xl font-black text-white">{{ todayConsumed.calories }}</span>
            <span class="ml-1 text-sm text-gray-500">/ {{ targets.calories }} kcal</span>
          </div>
          <div class="text-right">
            <span class="block text-sm text-gray-400">剩餘</span>
            <span class="text-xl font-bold" :class="targets.calories - todayConsumed.calories < 0 ? 'text-red-400' : 'text-green-400'">
              {{ targets.calories - todayConsumed.calories }}
            </span>
          </div>
        </div>

        <div class="w-full h-6 overflow-hidden bg-gray-700 rounded-full">
          <div 
            class="h-full transition-all duration-700 ease-out flex items-center justify-end pr-2 text-[10px] font-bold text-black/50"
            :class="progress.calories > 100 ? 'bg-red-500' : 'bg-gradient-to-r from-green-400 to-emerald-600'"
            :style="{ width: `${progress.calories}%` }"
          >
            {{ Math.round(progress.calories) }}%
          </div>
        </div>
        </section>

        <section class="grid grid-cols-3 gap-4">
        <div class="flex flex-col items-center p-3 bg-gray-800 border border-gray-700 rounded-xl">
          <span class="mb-1 text-xs font-bold text-blue-400">蛋白質</span>
          <div class="relative flex items-center justify-center w-14 h-14">
            <svg class="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="24" stroke="currentColor" stroke-width="4" fill="transparent" class="text-gray-700" />
              <circle cx="28" cy="28" r="24" stroke="currentColor" stroke-width="4" fill="transparent" 
                class="text-blue-500 transition-all duration-1000" 
                :stroke-dasharray="2 * Math.PI * 24" 
                :stroke-dashoffset="2 * Math.PI * 24 * (1 - progress.protein / 100)" 
                stroke-linecap="round" />
            </svg>
            <span class="absolute text-xs font-bold">{{ Math.round(progress.protein) }}%</span>
          </div>
          <span class="text-[10px] text-gray-500 mt-1">{{ todayConsumed.protein }}/{{ targets.protein }}g</span>
        </div>

        <div class="flex flex-col items-center p-3 bg-gray-800 border border-gray-700 rounded-xl">
          <span class="mb-1 text-xs font-bold text-orange-400">碳水</span>
          <div class="relative flex items-center justify-center w-14 h-14">
            <svg class="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="24" stroke="currentColor" stroke-width="4" fill="transparent" class="text-gray-700" />
              <circle cx="28" cy="28" r="24" stroke="currentColor" stroke-width="4" fill="transparent" 
                class="text-orange-500 transition-all duration-1000" 
                :stroke-dasharray="2 * Math.PI * 24" 
                :stroke-dashoffset="2 * Math.PI * 24 * (1 - progress.carbs / 100)" 
                stroke-linecap="round" />
            </svg>
            <span class="absolute text-xs font-bold">{{ Math.round(progress.carbs) }}%</span>
          </div>
          <span class="text-[10px] text-gray-500 mt-1">{{ todayConsumed.carbs }}/{{ targets.carbs }}g</span>
        </div>

        <div class="flex flex-col items-center p-3 bg-gray-800 border border-gray-700 rounded-xl">
          <span class="mb-1 text-xs font-bold text-red-400">脂肪</span>
          <div class="relative flex items-center justify-center w-14 h-14">
            <svg class="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="24" stroke="currentColor" stroke-width="4" fill="transparent" class="text-gray-700" />
              <circle cx="28" cy="28" r="24" stroke="currentColor" stroke-width="4" fill="transparent" 
                class="text-red-500 transition-all duration-1000" 
                :stroke-dasharray="2 * Math.PI * 24" 
                :stroke-dashoffset="2 * Math.PI * 24 * (1 - progress.fat / 100)" 
                stroke-linecap="round" />
            </svg>
            <span class="absolute text-xs font-bold">{{ Math.round(progress.fat) }}%</span>
          </div>
          <span class="text-[10px] text-gray-500 mt-1">{{ todayConsumed.fat }}/{{ targets.fat }}g</span>
        </div>
      </section>
      
      <!-- 紀錄列表 (補上遺漏的部分) -->
      <section>
        <div v-if="diaryStore.recentLogs.length === 0" class="flex flex-col items-center justify-center py-10 text-gray-500">
          <div class="mb-2 text-4xl">📜</div>
          <p class="text-sm">還沒有紀錄，快去吃點東西！</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="log in diaryStore.recentLogs" :key="log.id" 
            class="relative p-4 transition-all border border-gray-700 shadow-lg bg-gray-800/80 rounded-xl hover:bg-gray-800">
            
            <button @click="handleDeleteLog(log.id)" class="absolute text-gray-600 top-3 right-3 hover:text-red-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div class="flex items-start justify-between mb-1">
              <div>
                <h3 class="font-bold text-white">{{ log.food_name }}</h3>
                <span class="text-xs text-gray-400">{{ formatDate(log.timestamp) }}</span>
              </div>
              <div class="mr-6 text-right">
                <span class="text-xl font-black text-green-400">{{ log.calories }}</span>
                <span class="text-xs text-gray-500"> kcal</span>
              </div>
            </div>
            <div class="flex gap-2 mt-2 text-[10px]">
              <span class="px-2 py-0.5 text-blue-300 rounded bg-blue-900/30">P: {{ log.protein }}g</span>
              <span class="px-2 py-0.5 text-orange-300 rounded bg-orange-900/30">C: {{ log.carbs }}g</span>
              <span class="px-2 py-0.5 text-red-300 rounded bg-red-900/30">F: {{ log.fat }}g</span>
            </div>
          </div>
        </div>
      </section>
      </div>

      <!-- Tab 4: 更多 (More) -->
      <div v-if="activeTab === 'more'" class="space-y-8 animate-fade-in">
        <section class="p-6 bg-gray-800 border border-gray-700 shadow-xl rounded-2xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold tracking-widest text-gray-400 uppercase">體重趨勢 (Weight)</h3>
            <button @click="handleRecordWeight" class="px-3 py-1 text-xs font-bold text-white transition bg-blue-600 rounded-full hover:bg-blue-500">
              + 紀錄
            </button>
          </div>
          <WeightChart />
        </section>

        <button @click="goToSettings" class="flex items-center justify-between w-full p-4 transition bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-10 h-10 bg-gray-700 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span class="font-bold">個人設定</span>
          </div>
          <span class="text-gray-500">&rarr;</span>
        </button>
      </div>

    </main>

    <!-- 底部導航列 (Bottom Navigation) -->
    <div class="z-50 max-w-xl mx-auto bg-gray-800 border-t border-gray-700 btm-nav">
      
      <!-- 1. 每日任務 -->
      <button @click="activeTab = 'quests'" :class="{ 'active text-yellow-400 border-t-2 border-yellow-400': activeTab === 'quests', 'text-gray-400': activeTab !== 'quests' }">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
        <span class="text-xs btm-nav-label">任務</span>
      </button>

      <!-- 2. 水分 -->
      <button @click="activeTab = 'water'" :class="{ 'active text-blue-400 border-t-2 border-blue-400': activeTab === 'water', 'text-gray-400': activeTab !== 'water' }">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
        <span class="text-xs btm-nav-label">水分</span>
      </button>

      <!-- 3. 相機 (突出顯示) -->
      <button @click="goToScan" class="grid -mt-8 text-white border-4 border-gray-900 rounded-full shadow-lg w-14 h-14 bg-gradient-to-br from-green-500 to-blue-600 place-content-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      </button>

      <!-- 4. 日記 -->
      <button @click="activeTab = 'diary'" :class="{ 'active text-green-400 border-t-2 border-green-400': activeTab === 'diary', 'text-gray-400': activeTab !== 'diary' }">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
        <span class="text-xs btm-nav-label">日記</span>
      </button>

      <!-- 5. 更多 -->
      <button @click="activeTab = 'more'" :class="{ 'active text-purple-400 border-t-2 border-purple-400': activeTab === 'more', 'text-gray-400': activeTab !== 'more' }">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
        <span class="text-xs btm-nav-label">更多</span>
      </button>

    </div>

  </div>
</template>
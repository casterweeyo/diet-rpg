import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // ==========================================
  // 1. State (資料狀態)
  // ==========================================
  
  // 使用者基本資料
  const profile = ref({
    name: '',           // 暱稱
    gender: 'female',     // male | female
    age: 25,
    height: 160,        // cm
    weight: 50,         // kg
    activityLevel: 1.2, // 活動量係數 (1.2 ~ 1.9)
    goal: 'maintain',   // cut (減脂) | maintain (維持) | bulk (增肌)
  })

  // 系統設定
  const settings = ref({
    apiKey: '',         // Google Gemini API Key
    theme: 'dark',      // 主題色
    notifications: true // 是否開啟通知
  })

  // UI 狀態
  const showLevelUpModal = ref(false)

  // 體重紀錄 (用於繪製圖表)
  const weightHistory = ref([])

  // 遊戲化數據
  const game = ref({
    level: 1,
    currentXP: 0,
    totalXP: 0,         // 累積總經驗
    streak: 0,          // 連續登入天數
    waterIntake: 0,     // 今日飲水量 (ml)
    lastLoginDate: null, // 用於判斷 Streak
    // 每日任務狀態
    dailyQuests: {
      date: '', // 紀錄任務生成的日期 (YYYY-MM-DD)
      items: [] // 儲存任務列表與完成狀態
    }
  })

  // ==========================================
  // 2. Getters (計算屬性)
  // ==========================================

  // 是否已登入 (檢查是否有 API Key)
  const isLoggedIn = computed(() => !!settings.value.apiKey && !!profile.value.name)

  // 基礎代謝率 (BMR) - 使用 Mifflin-St Jeor 公式
  const bmr = computed(() => {
    // 公式: (10 × weight) + (6.25 × height) - (5 × age) + s
    // s: male +5, female -161
    const s = profile.value.gender === 'male' ? 5 : -161
    return (10 * profile.value.weight) + (6.25 * profile.value.height) - (5 * profile.value.age) + s
  })

  // 每日總消耗熱量 (TDEE)
  const tdee = computed(() => {
    return Math.round(bmr.value * profile.value.activityLevel)
  })

  // 每日飲水目標 (體重 * 33ml)
  const waterGoal = computed(() => {
    return Math.round(profile.value.weight * 33)
  })

  // 每日建議攝取目標 (依據目標調整)
  const dailyTargets = computed(() => {
    let targetCalories = tdee.value
    
    // 熱量調整
    if (profile.value.goal === 'cut') targetCalories -= 500  // 減脂建議 -500
    if (profile.value.goal === 'bulk') targetCalories += 300 // 增肌建議 +300

    // 營養素分配 (簡單估算: 蛋白質優先)
    // 減脂: 高蛋白 (40%), 中脂 (30%), 低碳 (30%)
    // 增肌: 中高蛋白 (30%), 中脂 (20%), 高碳 (50%)
    let macros = { p: 30, f: 30, c: 40 } // 預設比例 %

    if (profile.value.goal === 'cut') macros = { p: 40, f: 35, c: 25 }
    if (profile.value.goal === 'bulk') macros = { p: 30, f: 20, c: 50 }

    return {
      calories: targetCalories,
      protein: Math.round((targetCalories * (macros.p / 100)) / 4), // 1g 蛋白質 = 4 cal
      fat: Math.round((targetCalories * (macros.f / 100)) / 9),     // 1g 油脂 = 9 cal
      carbs: Math.round((targetCalories * (macros.c / 100)) / 4)    // 1g 碳水 = 4 cal
    }
  })

  // 升級所需經驗值 (曲線成長: Lv.1=100, Lv.2=120, Lv.10=~300)
  const nextLevelXP = computed(() => {
    return Math.floor(100 * Math.pow(1.1, game.value.level - 1))
  })

  // 經驗值進度百分比 (給 UI 進度條用)
  const xpProgress = computed(() => {
    return Math.min(100, (game.value.currentXP / nextLevelXP.value) * 100)
  })

  // ==========================================
  // 3. Actions (功能函式)
  // ==========================================

  // 更新使用者資料
  function updateProfile(newData) {
    Object.assign(profile.value, newData)
  }

  // 設定 API Key
  function setApiKey(key) {
    settings.value.apiKey = key
  }

  // 增加經驗值 (含升級邏輯)
  function addXP(amount) {
    game.value.currentXP += amount
    game.value.totalXP += amount

    // 檢查是否升級 (可能一次升多級)
    while (game.value.currentXP >= nextLevelXP.value) {
      game.value.currentXP -= nextLevelXP.value
      game.value.level++
      // 觸發升級 Modal
      showLevelUpModal.value = true
    }
  }

  // 關閉升級 Modal
  function closeLevelUpModal() {
    showLevelUpModal.value = false
  }

  // 增加飲水
  function addWater(amount) {
    game.value.waterIntake += amount
    if (game.value.waterIntake >= waterGoal.value) {
      completeQuest('water')
    }
  }

  // 紀錄體重
  function recordWeight(kg) {
    profile.value.weight = parseFloat(kg)
    const today = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    // 檢查今天是否已經紀錄過，有則更新，無則新增
    const index = weightHistory.value.findIndex(h => h.date === today)
    if (index !== -1) {
      weightHistory.value[index].weight = parseFloat(kg)
    } else {
      weightHistory.value.push({ date: today, weight: parseFloat(kg) })
    }
  }

  // 檢查並重置每日任務
  function checkDailyReset() {
    const today = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().split('T')[0]
    
    // 如果日期不同，重置任務
    if (game.value.dailyQuests.date !== today) {
      game.value.dailyQuests.date = today
      
      game.value.waterIntake = 0 // 重置飲水
      
      // 定義每日任務
      game.value.dailyQuests.items = [
        { id: 'login', title: '登入遊戲', desc: '回來看看你的角色', xp: 10, completed: false },
        { id: 'scan', title: '紀錄第一餐', desc: '使用 AI 掃描食物', xp: 50, completed: false },
        { id: 'protein', title: '蛋白質達標', desc: '攝取足夠的蛋白質', xp: 100, completed: false },
        { id: 'water', title: '喝水達標', desc: `喝足夠的水 (${waterGoal.value}ml)`, xp: 30, completed: false }
      ]

      // 處理連續登入 (Streak)
      if (game.value.lastLoginDate) {
        const lastDate = new Date(game.value.lastLoginDate)
        const diffTime = Math.abs(new Date(today) - lastDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) 
        
        if (diffDays === 1) game.value.streak++
        else if (diffDays > 1) game.value.streak = 1
      } else {
        game.value.streak = 1
      }
      
      game.value.lastLoginDate = today
    }
  }

  // 完成任務
  function completeQuest(questId) {
    const quest = game.value.dailyQuests.items.find(q => q.id === questId)
    if (quest && !quest.completed) {
      quest.completed = true
      addXP(quest.xp)
    }
  }

  // 重置/登出
  function logout() {
    settings.value.apiKey = ''
    profile.value.name = ''
    // 可以選擇是否要清空遊戲進度，這裡保留進度只清 Key
  }

  return {
    // State
    profile,
    settings,
    game,
    showLevelUpModal,
    weightHistory,
    // Getters
    isLoggedIn,
    bmr,
    tdee,
    dailyTargets,
    waterGoal,
    nextLevelXP,
    xpProgress,
    // Actions
    updateProfile,
    setApiKey,
    addXP,
    addWater,
    closeLevelUpModal,
    recordWeight,
    checkDailyReset,
    completeQuest,
    logout
  }
}, {
  persist: true // 開啟持久化 (資料自動存入 localStorage)
})
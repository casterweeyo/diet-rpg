import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { logToGoogleSheet } from '../services/googleSheet'
import { useUserStore } from './userStore'
import { getTodayDate } from '../utils/dateUtils'

export const useDiaryStore = defineStore('diary', () => {
  // 1. State: 儲存所有的飲食紀錄
  // 格式範例: { id: 17156234, date: '2024-05-14', timestamp: 17156234000, food_name: '漢堡', calories: 500, ... }
  const logs = ref([])

  // 2. Actions
  const addLog = (scanResult) => {
    const newLog = {
      ...scanResult, // 先展開傳入的資料，避免其中的 id 覆蓋掉系統生成的 id
      id: Date.now(),
      timestamp: Date.now(),
      date: getTodayDate(), // 儲存 YYYY-MM-DD (GMT+8)
    }
    logs.value.push(newLog)

    // 同步至 Google Sheet
    const userStore = useUserStore()

    // 檢查是否達成蛋白質任務
    if (todaySummary.value.protein >= userStore.dailyTargets.protein) {
      userStore.completeQuest('protein')
    }

    // 觸發「紀錄第一餐」任務 (只要有新增紀錄就算完成，包含快速增加)
    userStore.completeQuest('scan')

    // 請在此填入您的 Google Apps Script Web App URL
    const CENTRAL_SHEET_URL = 'https://script.google.com/macros/s/AKfycbwNCpfXsfem5-GwEWDwYl4OVa4BLMTRJmDVWR4xBNVKKv9ZxnF7wkpZDO5swo4uirV9vw/exec'

    if (CENTRAL_SHEET_URL) {
      logToGoogleSheet(
        CENTRAL_SHEET_URL, 
        userStore.profile, 
        userStore.game, 
        newLog
      )
    }
  }

  // 刪除紀錄
  const removeLog = (id) => {
    const index = logs.value.findIndex(l => l.id === id)
    if (index !== -1) logs.value.splice(index, 1)
  }

  // 3. Getters
  // 取得「今天」的營養攝取總和
  const todaySummary = computed(() => {
    const today = getTodayDate()
    
    // 篩選今天的紀錄
    const todayLogs = logs.value.filter(log => log.date === today)

    // 加總數值
    return todayLogs.reduce((acc, log) => {
      return {
        calories: acc.calories + (log.calories || 0),
        protein: acc.protein + (log.protein || 0),
        carbs: acc.carbs + (log.carbs || 0),
        fat: acc.fat + (log.fat || 0)
      }
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 })
  })

  // 取得最近的紀錄 (用於列表顯示)
  const recentLogs = computed(() => {
    return [...logs.value].sort((a, b) => b.timestamp - a.timestamp)
  })

  return {
    logs,
    addLog,
    removeLog,
    todaySummary,
    recentLogs
  }
}, {
  persist: true // 開啟自動儲存到 LocalStorage
})
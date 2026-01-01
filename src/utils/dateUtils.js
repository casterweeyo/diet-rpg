// 取得台灣時間 (GMT+8) 的 YYYY-MM-DD 字串
export const getTodayDate = () => {
  // 利用 UTC 時間偏移 8 小時來模擬台灣時間的日期
  return new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().split('T')[0]
}

// 根據當前小時判斷用餐時段
export const getMealTypeByTime = () => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 11) return 'breakfast'
  if (hour >= 11 && hour < 17) return 'lunch'
  if (hour >= 17 && hour < 22) return 'dinner'
  return 'snack'
}
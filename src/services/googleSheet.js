/**
 * 將飲食紀錄發送到 Google Sheet
 * @param {string} sheetUrl - Google Apps Script Web App URL
 * @param {Object} userProfile - 使用者資料 (用於分頁名稱)
 * @param {Object} gameData - 遊戲資料 (等級/經驗)
 * @param {Object} logData - 飲食紀錄資料
 */
export const logToGoogleSheet = async (sheetUrl, userProfile, gameData, logData) => {
  if (!sheetUrl) return

  const now = new Date()
  
  const payload = {
    userName: userProfile.name,
    date: now.toLocaleDateString('zh-TW'),
    time: now.toLocaleTimeString('zh-TW'),
    level: gameData.level,
    xp: gameData.currentXP,
    food_name: logData.food_name,
    calories: logData.calories,
    protein: logData.protein,
    carbs: logData.carbs,
    fat: logData.fat,
    mealType: logData.mealType
  }

  try {
    // mode: 'no-cors' 是必須的，因為 GAS 不支援標準 CORS 回應，但資料仍會寫入
    await fetch(sheetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    console.log('已同步至 Google Sheet')
  } catch (error) {
    console.error('Google Sheet 同步失敗', error)
  }
}
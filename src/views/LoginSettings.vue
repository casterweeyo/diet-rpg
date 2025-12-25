<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const userStore = useUserStore()

// 綁定資料到 Store 的 profile
const form = ref({
  name: userStore.profile?.name || '',
  apiKey: userStore.settings?.apiKey || '',
  roundUpCalories: userStore.settings?.roundUpCalories || false,
  height: userStore.profile?.height || 170,
  weight: userStore.profile?.weight || 60,
  gender: userStore.profile?.gender || 'male',
  age: userStore.profile?.age || 25,
  goal: userStore.profile?.goal || 'maintain',
  activityLevel: userStore.profile?.activityLevel || 1.375,
  proteinPerKg: userStore.profile?.proteinPerKg || 2.0,
  fatPerKg: userStore.profile?.fatPerKg || 0.9,
  customBmr: userStore.profile?.customBmr || null
})

const saveSettings = () => {
  if (!form.value.apiKey.startsWith('AIza')) {
    alert('請輸入有效的 Google Gemini API Key')
    return
  }

  // 更新 Store
  userStore.updateProfile({
    name: form.value.name,
    height: form.value.height,
    weight: form.value.weight,
    gender: form.value.gender,
    age: form.value.age,
    goal: form.value.goal,
    activityLevel: form.value.activityLevel,
    proteinPerKg: form.value.proteinPerKg,
    fatPerKg: form.value.fatPerKg,
    customBmr: form.value.customBmr
  })
  
  userStore.setApiKey(form.value.apiKey)

  if (userStore.settings) {
    userStore.settings.roundUpCalories = form.value.roundUpCalories
  }

  alert('設定已儲存！')
  router.push('/')
}

// 即時計算 BMR 預覽 (供使用者參考)
const calculatedBmr = computed(() => {
  const s = form.value.gender === 'male' ? 5 : -161
  const val = (10 * form.value.weight) + (6.25 * form.value.height) - (5 * form.value.age) + s
  return Math.round(val)
})

const handleReset = () => {
  if (confirm('確定要清除所有資料嗎？這將無法復原！(包含等級、經驗值、體重紀錄等)')) {
    userStore.resetAllData()
    alert('資料已重置，請重新輸入設定。')
    window.location.reload() // 重新整理頁面以確保狀態乾淨
  }
}

const handleClose = () => {
  router.push('/')
}
</script>

<template>
  <div class="max-w-xl min-h-screen p-4 mx-auto text-white bg-gray-900">
    <div class="relative w-full p-6 bg-gray-800 border border-gray-700 shadow-2xl rounded-xl">
      
      <button v-if="userStore.isLoggedIn" @click="handleClose" class="absolute text-gray-400 top-4 right-4 hover:text-white">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <h1 class="mb-2 text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
        資料設定
      </h1>
      <p class="mb-6 text-sm text-center text-gray-400">
        設定你的基本數值與 API 金鑰
      </p>

      <form @submit.prevent="saveSettings" class="space-y-4">
        
        <div class="p-4 bg-gray-900 border rounded-lg border-yellow-600/50">
          <label class="block mb-2 text-sm font-bold text-yellow-500">Gemini API Key</label>
          <input v-model="form.apiKey" type="password" required placeholder="AIza..."
            class="w-full p-3 text-white bg-gray-800 border border-gray-600 rounded-lg outline-none focus:border-yellow-500" />
          <a href="https://aistudio.google.com/app/apikey" target="_blank" class="block mt-1 text-xs text-blue-400">取得免費 Key &rarr;</a>
        </div>

        <div>
          <label class="text-gray-300 label">暱稱</label>
          <input v-model="form.name" type="text" required class="w-full bg-gray-900 input input-bordered" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-gray-300 label">身高 (cm)</label>
            <input v-model="form.height" type="number" required class="w-full bg-gray-900 input input-bordered" />
          </div>
          <div>
            <label class="text-gray-300 label">體重 (kg)</label>
            <input v-model="form.weight" type="number" required class="w-full bg-gray-900 input input-bordered" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="text-gray-300 label">性別</label>
            <select v-model="form.gender" class="w-full text-base bg-gray-900 select select-bordered">
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>
          <div>
            <label class="text-gray-300 label">年齡</label>
            <input v-model="form.age" type="number" required class="w-full bg-gray-900 input input-bordered" />
          </div>
        </div>

        <div>
          <label class="text-gray-300 label">日常活動量</label>
          <select v-model="form.activityLevel" class="w-full text-base bg-gray-900 select select-bordered">
            <option :value="1.2">久坐 (辦公室工作，少運動)</option>
            <option :value="1.375">輕度活動 (每週運動 1-3 天)</option>
            <option :value="1.55">中度活動 (每週運動 3-5 天)</option>
            <option :value="1.725">高度活動 (每週運動 6-7 天)</option>
            <option :value="1.9">超高度活動 (勞力工作/運動員)</option>
          </select>
        </div>

        <div>
          <label class="text-gray-300 label">目標</label>
          <select v-model="form.goal" class="w-full text-base bg-gray-900 select select-bordered">
            <option value="maintain">維持體重</option>
            <option value="cut">減脂 (Cut)</option>
            <option value="bulk">增肌 (Bulk)</option>
          </select>
        </div>

        <!-- 進階營養素設定 (僅在減脂模式顯示) -->
        <div v-if="form.goal === 'cut'" class="p-4 space-y-4 border border-blue-500/30 bg-blue-900/10 rounded-xl animate-fade-in">
          <h3 class="text-sm font-bold text-blue-400">進階：自訂營養係數 (g/kg)</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-gray-300 label">蛋白質係數</label>
              <input v-model="form.proteinPerKg" type="number" step="0.1" min="1.0" max="3.0" class="w-full bg-gray-900 input input-bordered" placeholder="預設 2.0" />
              <div class="mt-1 text-xs text-right text-blue-400">≈ {{ Math.round(form.weight * form.proteinPerKg) }} g</div>
            </div>
            <div>
              <label class="text-gray-300 label">脂肪係數</label>
              <input v-model="form.fatPerKg" type="number" step="0.1" min="0.5" max="1.5" class="w-full bg-gray-900 input input-bordered" placeholder="預設 0.9" />
              <div class="mt-1 text-xs text-right text-blue-400">≈ {{ Math.round(form.weight * form.fatPerKg) }} g</div>
            </div>
          </div>
          <p class="text-xs text-gray-500">剩餘熱量將自動分配給碳水化合物。</p>
          <!-- 自訂 BMR -->
          <div class="form-control">
            <label class="label">
              <span class="text-gray-300 label-text">基礎代謝率 (BMR)</span>
            </label>
            <div class="flex gap-2">
              <div class="flex items-center justify-center w-1/2 text-gray-400 bg-gray-800 border border-gray-700 rounded-lg">
                預估: {{ calculatedBmr }}
              </div>
              <input v-model="form.customBmr" type="number" class="w-1/2 bg-gray-900 input input-bordered" placeholder="自訂數值 (選填)" />
            </div>
            <p class="mt-1 text-xs text-gray-500">若輸入自訂數值，將優先使用該數值計算 TDEE。</p>
          </div>
        </div>

        

        <div class="form-control">
          <label class="cursor-pointer label">
            <span class="text-gray-300 label-text">熱量無條件進位 (整數)</span>
            <input type="checkbox" v-model="form.roundUpCalories" class="toggle toggle-primary" />
          </label>
          <p class="text-xs text-gray-500">開啟後，所有熱量顯示將無條件進位至整數 (例如: 120.5 => 121)</p>
        </div>

        <button type="submit" 
          class="w-full mt-6 text-lg text-white border-none btn btn-primary bg-gradient-to-r from-green-500 to-blue-600">
          開始冒險
        </button>
      
      </form>

      <div class="pt-6 mt-8 border-t border-gray-700">
        <button @click="handleReset" class="w-full btn btn-outline btn-error">
          ⚠️ 清除所有資料 (重置)
        </button>
      </div>
    </div>
  </div>
</template>
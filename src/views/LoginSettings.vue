<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const userStore = useUserStore()

// 綁定資料到 Store 的 profile
const form = ref({
  name: userStore.profile.name,
  apiKey: userStore.settings.apiKey,
  height: userStore.profile.height,
  weight: userStore.profile.weight,
  gender: userStore.profile.gender,
  age: userStore.profile.age,
  goal: userStore.profile.goal,
  activityLevel: userStore.profile.activityLevel
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
    activityLevel: form.value.activityLevel
  })
  
  userStore.setApiKey(form.value.apiKey)

  alert('設定已儲存！')
  router.push('/')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-6 text-white bg-gray-900">
    <div class="w-full max-w-md p-8 bg-gray-800 border border-gray-700 shadow-2xl rounded-xl">
      
      <h1 class="mb-2 text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
        資料設定
      </h1>
      <p class="mb-8 text-sm text-center text-gray-400">
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

        <button type="submit" 
          class="w-full mt-6 text-lg text-white border-none btn btn-primary bg-gradient-to-r from-green-500 to-blue-600">
          開始冒險
        </button>
      
      </form>
    </div>
  </div>
</template>
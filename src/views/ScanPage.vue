<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { analyzeImage, analyzeText } from '../services/gemini'
import { fetchProductByBarcode } from '../services/barcode'
import CameraInput from '../components/Diet/CameraInput.vue'
import BarcodeScanner from '../components/Diet/BarcodeScanner.vue'
import { useDiaryStore } from '../stores/diaryStore'

const diaryStore = useDiaryStore()
// 狀態管理
const router = useRouter()
const userStore = useUserStore()

const mode = ref('camera') // camera | text | barcode
const currentFile = ref(null)
const isAnalyzing = ref(false)
const errorMsg = ref('')
const scanResult = ref(null) // 存放 AI 回傳的 JSON
const previewUrl = ref(null) // 圖片預覽連結

// 文字與條碼輸入
const textInput = ref('')
const barcodeInput = ref('')
const showBarcodeScanner = ref(false)

// 處理圖片選擇
const handleImageSelected = (file) => {
  currentFile.value = file
  scanResult.value = null // 重選圖片時清空舊結果
  errorMsg.value = ''
  
  // 產生預覽圖
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)
}

// 執行分析 (統一入口)
const startAnalysis = async () => {
  if (!userStore.settings.apiKey) {
    alert("請先至設定頁面輸入 API Key")
    router.push('/settings')
    return
  }

  isAnalyzing.value = true
  errorMsg.value = ''

  try {
    let data = null
    
    if (mode.value === 'camera') {
      if (!currentFile.value) return
      data = await analyzeImage(currentFile.value, userStore.settings.apiKey)
    } else if (mode.value === 'text') {
      if (!textInput.value) return
      data = await analyzeText(textInput.value, userStore.settings.apiKey)
    } else if (mode.value === 'barcode') {
      if (!barcodeInput.value) return
      data = await fetchProductByBarcode(barcodeInput.value)
    }

    scanResult.value = data
  } catch (err) {
    errorMsg.value = err.message || "分析失敗，請檢查網路或 Key"
  } finally {
    isAnalyzing.value = false
  }
}

// 嘗試使用瀏覽器原生 BarcodeDetector (如果支援)
const scanBarcodeWithCamera = async () => {
  showBarcodeScanner.value = true
}

// 處理掃描到的條碼
const handleBarcodeScanned = (scannedCode) => {
  barcodeInput.value = scannedCode
  showBarcodeScanner.value = false
  startAnalysis() // 自動開始分析
}

// 確認並紀錄 (獲得經驗值!)
const confirmLog = () => {
  if (!scanResult.value) return

  // 1. 寫入日記資料庫
  diaryStore.addLog(scanResult.value)
  
  // 2. 觸發任務完成 (紀錄第一餐)
  userStore.completeQuest('scan')
  
  // 額外獎勵：每次紀錄都給一點基礎 XP (例如 10)，鼓勵多紀錄
  userStore.addXP(10)
  
  // 3. 顯示成功並跳轉
  router.push('/')
}
</script>

<template>
  <div class="max-w-xl min-h-screen p-4 pb-20 mx-auto bg-gray-900">
    
    <BarcodeScanner v-if="showBarcodeScanner" @close="showBarcodeScanner = false" @scanned="handleBarcodeScanned" />

    <header class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
          飲食掃描儀
        </h1>
        <p class="text-sm text-gray-400">拍下食物，讓 AI 幫你計算熱量</p>
      </div>
      <button @click="router.push('/')" class="btn btn-circle btn-ghost btn-sm">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </header>

    <!-- 分頁切換 -->
    <div role="tablist" class="p-1 mb-6 bg-gray-800 tabs tabs-boxed">
      <a role="tab" class="transition-all tab" :class="{ 'tab-active bg-green-600 text-white': mode === 'camera' }" @click="mode = 'camera'; scanResult = null">📸 拍照</a>
      <a role="tab" class="transition-all tab" :class="{ 'tab-active bg-blue-600 text-white': mode === 'text' }" @click="mode = 'text'; scanResult = null">📝 文字</a>
      <a role="tab" class="transition-all tab" :class="{ 'tab-active bg-purple-600 text-white': mode === 'barcode' }" @click="mode = 'barcode'; scanResult = null">║▌ 條碼</a>
    </div>

    <!-- 1. 拍照模式 -->
    <div v-if="mode === 'camera' && !scanResult">
      <CameraInput @image-selected="handleImageSelected" />
      
      <!-- 圖片預覽 -->
      <div v-if="previewUrl" class="relative mt-4 overflow-hidden border border-gray-700 shadow-lg rounded-xl">
        <img :src="previewUrl" class="object-cover w-full h-64" alt="Food Preview" />
      </div>

      <div v-if="currentFile" class="mt-6">
        <button @click="startAnalysis" :disabled="isAnalyzing" class="btn-action bg-gradient-to-r from-green-500 to-blue-600">
          <span v-if="isAnalyzing" class="loading loading-spinner loading-sm"></span> {{ isAnalyzing ? 'AI 分析中...' : '開始分析圖片' }}
        </button>
      </div>
    </div>

    <!-- 2. 文字模式 -->
    <div v-if="mode === 'text' && !scanResult" class="space-y-4">
      <textarea 
        v-model="textInput"
        class="w-full h-40 text-lg bg-gray-800 textarea textarea-bordered" 
        placeholder="例如：一個大麥克漢堡配中薯，還有一杯可樂..."
      ></textarea>
      <button @click="startAnalysis" :disabled="!textInput || isAnalyzing" class="btn-action bg-gradient-to-r from-blue-500 to-purple-600">
        <span v-if="isAnalyzing" class="loading loading-spinner loading-sm"></span> {{ isAnalyzing ? 'AI 估算中...' : '送出文字分析' }}
      </button>
    </div>

    <!-- 3. 條碼模式 -->
    <div v-if="mode === 'barcode' && !scanResult" class="space-y-4">
      <div class="form-control">
        <label class="label"><span class="text-gray-400 label-text">輸入國際條碼 (EAN/UPC)</span></label>
        <div class="flex gap-2">
          <input v-model="barcodeInput" type="number" placeholder="例如: 4710018183204" class="flex-1 bg-gray-800 input input-bordered" />
          <button @click="scanBarcodeWithCamera" class="border-gray-600 btn btn-square btn-outline">
            📷
          </button>
        </div>
      </div>
      <button @click="startAnalysis" :disabled="!barcodeInput || isAnalyzing" class="btn-action bg-gradient-to-r from-purple-500 to-pink-600">
        <span v-if="isAnalyzing" class="loading loading-spinner loading-sm"></span> {{ isAnalyzing ? '查詢資料庫...' : '查詢條碼' }}
      </button>
      <p class="mt-4 text-xs text-center text-gray-500">資料來源: OpenFoodFacts</p>
    </div>

    <div v-if="errorMsg" class="p-4 mt-4 text-sm text-red-200 border border-red-500 bg-red-900/50 rounded-xl">
      ⚠️ {{ errorMsg }}
    </div>

    <div v-if="scanResult" class="mt-6 animate-fade-in-up">
      <div class="overflow-hidden bg-gray-800 border border-gray-700 shadow-2xl rounded-xl">
        
        <div class="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-700/50">
          <h2 class="text-xl font-bold text-white">{{ scanResult.food_name }}</h2>
          <span class="px-3 py-1 text-xs font-bold text-yellow-300 border rounded-full bg-yellow-500/20 border-yellow-500/30">
            +20 XP
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4 p-6">
          <div class="col-span-2 p-4 text-center border border-gray-600 rounded-lg bg-gray-900/50">
            <span class="block text-xs tracking-wider text-gray-400 uppercase">熱量 (Calories)</span>
            <span class="text-3xl font-black text-green-400">{{ scanResult.calories }}</span>
            <span class="ml-1 text-sm text-gray-500">kcal</span>
          </div>

          <div class="p-3 text-center rounded-lg bg-gray-900/30">
            <span class="block text-xs text-gray-500">蛋白質</span>
            <span class="text-lg font-bold text-blue-400">{{ scanResult.protein }}g</span>
          </div>
          
          <div class="p-3 text-center rounded-lg bg-gray-900/30">
            <span class="block text-xs text-gray-500">碳水</span>
            <span class="text-lg font-bold text-orange-400">{{ scanResult.carbs }}g</span>
          </div>
          
          <div class="col-span-2 p-3 text-center rounded-lg bg-gray-900/30">
            <span class="block text-xs text-gray-500">脂肪</span>
            <span class="text-lg font-bold text-red-400">{{ scanResult.fat }}g</span>
          </div>
        </div>

        <div class="px-6 pb-6">
          <div class="flex gap-3 p-3 border rounded-lg bg-blue-900/20 border-blue-500/30">
            <span class="text-xl">💡</span>
            <p class="text-sm italic text-blue-200">
              "{{ scanResult.advice }}"
            </p>
          </div>
        </div>

        <div class="flex gap-3 p-4 bg-gray-900">
          <button @click="scanResult = null" class="flex-1 py-3 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-800">
            放棄
          </button>
          <button @click="confirmLog" class="w-2/3 py-3 font-bold text-white bg-green-600 rounded-lg shadow-lg flex-2 hover:bg-green-500">
            確認並獲得 XP
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
/* 簡單的進場動畫 */
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn-action {
  @apply flex items-center justify-center w-full gap-2 py-4 text-lg font-bold text-white transition-all shadow-lg rounded-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
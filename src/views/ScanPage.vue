<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/userStore'
import { analyzeImage, analyzeText } from '../services/gemini'
import { fetchProductByBarcode } from '../services/barcode'
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
const addToCustom = ref(false) // 是否加入常用飲食

// 文字與條碼輸入
const textInput = ref('')
const barcodeInput = ref('')
const showBarcodeScanner = ref(false)
const fileInputRef = ref(null)

// 用餐時段 (根據目前時間自動預選)
const getMealTypeByTime = () => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 11) return 'breakfast'
  if (hour >= 11 && hour < 17) return 'lunch'
  if (hour >= 17 && hour < 22) return 'dinner'
  return 'snack'
}
const mealType = ref(getMealTypeByTime())

// 取得當前活躍任務
const activeQuest = computed(() => {
  return userStore.game.dailyQuests.items.find(q => !q.completed) || userStore.game.dailyQuests.items[0]
})

// 觸發相機/檔案選擇
const triggerCamera = () => {
  if (scanResult.value) {
    // 如果已有結果，視為重置
    scanResult.value = null
    previewUrl.value = null
    currentFile.value = null
    return
  }
  
  if (previewUrl.value && !isAnalyzing.value) {
    // 如果已有圖片但未分析，開始分析
    startAnalysis()
    return
  }

  fileInputRef.value.click()
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    currentFile.value = file
    scanResult.value = null
    errorMsg.value = ''
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = URL.createObjectURL(file)
  }
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

  if (!mealType.value) {
    alert('請選擇用餐時段')
    return
  }

  // 1. 寫入日記資料庫
  diaryStore.addLog({
    ...scanResult.value,
    mealType: mealType.value // 加入用餐時段
  })
  
  // 2. 觸發任務完成 (紀錄第一餐)
  userStore.completeQuest('scan')
  
  // 額外獎勵：每次紀錄都給一點基礎 XP (例如 10)，鼓勵多紀錄
  userStore.addXP(10)
  
  // 4. 如果勾選加入常用飲食
  if (addToCustom.value) {
    if (!userStore.settings.quickAddItems) userStore.settings.quickAddItems = []
    userStore.settings.quickAddItems.push({
      name: scanResult.value.food_name,
      calories: scanResult.value.calories,
      protein: scanResult.value.protein,
      carbs: scanResult.value.carbs,
      fat: scanResult.value.fat,
      icon: 'restaurant'
    })
  }

  // 3. 顯示成功並跳轉
  router.push('/')
}

const quickAddFood = (name, calories, protein, carbs, fat) => {
  diaryStore.addLog({
    food_name: name,
    calories,
    protein,
    carbs,
    fat,
    mealType: getMealTypeByTime(),
    timestamp: Date.now()
  })
  userStore.addXP(5)
  alert(`已新增 ${name}`)
}

const quickAddWater = () => {
    userStore.addWater(250)
    alert('已新增 250ml 水分')
}
</script>

<template>
  <div class="flex flex-col min-h-screen overflow-hidden text-white bg-[#102216] font-sans selection:bg-[#13ec5b] selection:text-black max-w-xl mx-auto">
    
    <BarcodeScanner v-if="showBarcodeScanner" @close="showBarcodeScanner = false" @scanned="handleBarcodeScanned" />

    <!-- Hidden File Input -->
    <input 
      type="file" 
      ref="fileInputRef"
      accept="image/*" 
      capture="environment"
      class="hidden"
      @change="handleFileChange"
    />

    <!-- Top App Bar -->
    <header class="sticky top-0 z-20 flex items-center justify-between p-4 backdrop-blur-md bg-[#102216]/90">
      <button @click="router.push('/')" class="flex items-center justify-center transition-colors rounded-full size-10 hover:bg-white/10">
        <span class="text-2xl material-symbols-outlined">arrow_back</span>
      </button>
      <h2 class="text-lg font-bold tracking-tight uppercase">食物掃描器</h2>
      <button class="relative flex items-center justify-center transition-colors rounded-full size-10 hover:bg-white/10">
        <span class="text-2xl material-symbols-outlined">backpack</span>
        <div class="absolute top-2 right-2 size-2 bg-[#13ec5b] rounded-full shadow-[0_0_15px_rgba(19,236,91,0.4)]"></div>
      </button>
    </header>


    <!-- Main Content Area -->
    <main class="relative flex flex-col flex-1 w-full h-full max-w-md mx-auto overflow-hidden">
      
      <!-- Tab Mode Switcher -->
      <div class="z-10 px-4 mb-4">
        <div class="flex items-center justify-center w-full h-12 p-1 border rounded-full bg-[#1c2e22] border-white/10">
          <button @click="mode = 'camera'; scanResult = null" class="flex items-center justify-center flex-1 h-full text-sm font-bold transition-all duration-300 rounded-full" :class="mode === 'camera' ? 'bg-[#13ec5b] text-[#102216] shadow-[0_0_15px_rgba(19,236,91,0.4)]' : 'text-gray-400 hover:bg-white/5'">
            <span class="material-symbols-outlined text-[18px] mr-1.5">photo_camera</span>
            <span>AI Scan</span>
          </button>
          <button @click="mode = 'text'; scanResult = null" class="flex items-center justify-center flex-1 h-full text-sm font-bold transition-all duration-300 rounded-full" :class="mode === 'text' ? 'bg-[#13ec5b] text-[#102216] shadow-[0_0_15px_rgba(19,236,91,0.4)]' : 'text-gray-400 hover:bg-white/5'">
            <span class="material-symbols-outlined text-[18px] mr-1.5">edit_note</span>
            <span>AI 文字輸入</span>
          </button>
          <button @click="mode = 'barcode'; scanResult = null" class="flex items-center justify-center flex-1 h-full text-sm font-bold transition-all duration-300 rounded-full" :class="mode === 'barcode' ? 'bg-[#13ec5b] text-[#102216] shadow-[0_0_15px_rgba(19,236,91,0.4)]' : 'text-gray-400 hover:bg-white/5'">
            <span class="material-symbols-outlined text-[18px] mr-1.5">qr_code_scanner</span>
            <span>條碼</span>
          </button>
        </div>
      </div>

      <!-- Viewfinder / Content -->
      <div class="relative flex-1 mx-4 overflow-hidden border shadow-2xl bg-black/80 rounded-2xl border-white/10 group">
        
        <!-- Result Overlay (If analyzed) -->
        <div v-if="scanResult" class="absolute inset-0 z-30 overflow-y-auto bg-[#102216]/95 backdrop-blur-sm">
           <!-- Result Card Content -->
           <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-2xl font-bold text-white">{{ scanResult.food_name }}</h2>
                <span class="px-3 py-1 text-xs font-bold text-[#102216] bg-[#13ec5b] rounded-full">+20 XP</span>
              </div>
              <!-- 用餐時段 Select -->
              <div class="mb-6">
                 <label class="block mb-2 text-xs font-bold text-gray-400 uppercase">用餐時段</label>
                 <select v-model="mealType" class="w-full p-3 text-white bg-[#1c2e22] border border-white/10 rounded-lg outline-none focus:border-[#13ec5b]">
                    <option value="breakfast">早餐</option>
                    <option value="lunch">午餐</option>
                    <option value="dinner">晚餐</option>
                    <option value="snack">宵夜</option>
                 </select>
              </div>
              <!-- Stats -->
              <div class="grid grid-cols-2 gap-4 mb-6">
                 <div class="col-span-2 p-4 text-center border rounded-xl bg-[#1c2e22] border-white/10">
                    <span class="block text-xs tracking-wider text-gray-400 uppercase">熱量</span>
                    <span class="text-4xl font-black text-[#13ec5b]">{{ userStore.settings?.roundUpCalories ? Math.ceil(scanResult.calories) : scanResult.calories }}</span>
                    <span class="ml-1 text-sm text-gray-500">kcal</span>
                 </div>
                 <div class="p-3 text-center rounded-xl bg-[#1c2e22]/50">
                    <span class="block text-xs text-gray-500">蛋白質</span>
                    <span class="text-xl font-bold text-blue-400">{{ scanResult.protein }}g</span>
                 </div>
                 <div class="p-3 text-center rounded-xl bg-[#1c2e22]/50">
                    <span class="block text-xs text-gray-500">碳水</span>
                    <span class="text-xl font-bold text-orange-400">{{ scanResult.carbs }}g</span>
                 </div>
                 <div class="col-span-2 p-3 text-center rounded-xl bg-[#1c2e22]/50">
                    <span class="block text-xs text-gray-500">脂肪</span>
                    <span class="text-xl font-bold text-red-400">{{ scanResult.fat }}g</span>
                 </div>
              </div>
              
              <!-- Add to Custom Checkbox -->
              <div class="mb-4 form-control">
                <label class="justify-start gap-3 cursor-pointer label">
                  <input type="checkbox" v-model="addToCustom" class="checkbox checkbox-primary checkbox-sm" />
                  <span class="text-sm text-gray-300 label-text">同時加入「自訂常用飲食」清單</span>
                </label>
              </div>

              <!-- Actions -->
              <div class="flex gap-3">
                 <button @click="scanResult = null" class="flex-1 py-3 font-bold text-gray-400 border border-gray-600 rounded-xl hover:bg-white/5">取消</button>
                 <button @click="confirmLog" class="flex-[2] py-3 font-bold text-[#102216] bg-[#13ec5b] rounded-xl shadow-[0_0_15px_rgba(19,236,91,0.4)] hover:bg-[#13ec5b]/90">送出紀錄</button>
              </div>
           </div>
        </div>

        <!-- Camera Mode View -->
        <div v-if="mode === 'camera'" class="w-full h-full">
           <img v-if="previewUrl" :src="previewUrl" class="object-cover w-full h-full opacity-80" />
           <div v-else class="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
           
           <!-- HUD Overlay -->
           <div class="absolute inset-0 flex flex-col items-center justify-center p-6 pointer-events-none">
              <!-- Corners -->
              <div class="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-[#13ec5b] rounded-tl-lg shadow-[0_0_10px_rgba(19,236,91,0.5)]"></div>
              <div class="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-[#13ec5b] rounded-tr-lg shadow-[0_0_10px_rgba(19,236,91,0.5)]"></div>
              <div class="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-[#13ec5b] rounded-bl-lg shadow-[0_0_10px_rgba(19,236,91,0.5)]"></div>
              <div class="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-[#13ec5b] rounded-br-lg shadow-[0_0_10px_rgba(19,236,91,0.5)]"></div>
              
              <!-- Reticle -->
              <div v-if="!previewUrl" class="relative flex items-center justify-center w-48 h-48 border rounded-lg border-[#13ec5b]/30">
                 <div class="w-full h-[1px] bg-[#13ec5b]/50 absolute top-1/2 left-0 transform -translate-y-1/2 scan-line shadow-[0_0_8px_rgba(19,236,91,0.8)]"></div>
                 <div class="absolute -top-3 text-[#13ec5b]/80 text-[10px] font-mono tracking-widest bg-black/50 px-2 rounded">拍攝食物或包裝營養成分</div>
                 <span class="material-symbols-outlined text-[#13ec5b]/50 text-4xl animate-pulse">center_focus_weak</span>
              </div>

              <!-- Info -->
              <div v-if="!previewUrl" class="absolute flex flex-col items-center gap-1 bottom-10">

                 <p class="text-[#13ec5b]/80 text-xs font-mono bg-black/40 px-2 py-1 rounded border border-[#13ec5b]/20">AI READY</p>
              </div>
           </div>
        </div>

        <!-- Text Mode View -->
        <div v-if="mode === 'text'" class="flex flex-col w-full h-full p-6">
           <textarea v-model="textInput" class="flex-1 w-full p-4 text-lg text-white bg-transparent border-none outline-none resize-none placeholder-white/30" placeholder="請敘述你的食物..例如：一個全家的烤雞三明治+光泉無糖豆漿"></textarea>
           <div class="flex justify-end">
              <span class="text-xs text-[#13ec5b]/70 font-mono">{{ textInput.length }}個字</span>
           </div>
        </div>

        <!-- Barcode Mode View -->
        <div v-if="mode === 'barcode'" class="flex flex-col items-center justify-center w-full h-full gap-4 p-6">
           <div class="w-full max-w-xs">
              <div class="flex">
                 <input v-model="barcodeInput" type="number" class="w-full p-3 text-center text-white bg-[#1c2e22] border border-white/10 rounded-xl outline-none focus:border-[#13ec5b]" placeholder="輸入條碼"/>
              </div>
           </div>
           <button @click="scanBarcodeWithCamera" class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#13ec5b] border border-[#13ec5b]/30 rounded-lg hover:bg-[#13ec5b]/10">
              <span class="material-symbols-outlined">qr_code_scanner</span>開啟相機掃描
           </button>
        </div>

      </div>

      <!-- Camera Controls -->
      <div class="flex flex-col items-center justify-center px-4 pt-6 pb-2 bg-[#102216]">
         <div class="flex items-center justify-center w-full gap-8">
            <!-- Gallery Button -->
            <button @click="fileInputRef.click()" class="flex flex-col items-center gap-1 group">
               <div class="flex items-center justify-center text-white transition-all border shadow-lg size-12 rounded-full bg-[#1c2e22] border-white/10 group-hover:bg-white/10">
                  <span class="text-xl material-symbols-outlined">photo_library</span>
               </div>
            </button>

            <!-- Main Trigger Button -->
            <button @click="mode === 'text' || mode === 'barcode' ? startAnalysis() : triggerCamera()" :disabled="isAnalyzing" class="relative flex items-center justify-center transition-transform duration-100 bg-transparent rounded-full size-20 group active:scale-95">
               <div class="absolute inset-0 transition-colors border-2 rounded-full border-[#13ec5b]/30 group-hover:border-[#13ec5b]/60"></div>
               <div class="absolute inset-1 border rounded-full border-[#13ec5b]/20"></div>
               <div class="size-16 rounded-full bg-[#13ec5b] flex items-center justify-center shadow-[0_0_25px_rgba(19,236,91,0.6)] z-10">
                  <span v-if="isAnalyzing" class="loading loading-spinner text-[#102216]"></span>
                  <span v-else-if="previewUrl || mode === 'text' || mode === 'barcode'" class="text-3xl material-symbols-outlined text-[#102216]">bolt</span>
                  <span v-else class="text-4xl material-symbols-outlined text-[#102216]">search</span>
               </div>
            </button>

            <!-- Flash/Reset Button -->
            <button @click="previewUrl = null; scanResult = null; textInput = ''; barcodeInput = ''" class="flex flex-col items-center gap-1 group">
               <div class="flex items-center justify-center text-white transition-all border shadow-lg size-12 rounded-full bg-[#1c2e22] border-white/10 group-hover:bg-white/10">
                  <span class="text-xl material-symbols-outlined">refresh</span>
               </div>
            </button>
         </div>
      </div>
    </main>

    <!-- Quick Inventory (Bottom Sheet) -->
    <div class="pt-4 pb-6 border-t bg-[#1c2e22] border-white/5">
       <div class="flex items-center justify-between px-4 mb-3">
          <h3 class="text-sm font-bold tracking-wide text-gray-300 uppercase">快速增加</h3>
       </div>
       <div class="flex gap-3 px-4 pb-2 overflow-x-auto no-scrollbar">
          <!-- Dynamic Items from Settings -->
          <button v-for="(item, index) in userStore.settings.quickAddItems" :key="index" @click="quickAddFood(item.name, item.calories, item.protein, item.carbs, item.fat)" class="flex flex-col items-center gap-2 min-w-[72px] group">
             <div class="relative overflow-hidden transition-colors border size-14 rounded-xl bg-[#102216] border-white/10 group-hover:border-[#13ec5b]/50">
                <div class="flex items-center justify-center w-full h-full bg-white/5">
                   <span class="text-gray-500 material-symbols-outlined">{{ item.icon || 'fastfood' }}</span>
                </div>
                <div class="absolute bottom-0 right-0 px-1 text-[10px] font-bold text-[#102216] rounded-tl bg-[#13ec5b]">+</div>
             </div>
             <span class="text-[10px] font-medium text-gray-400 truncate w-full text-center">{{ item.name }}</span>
          </button>
          <!-- Water -->
          <button @click="quickAddWater" class="flex flex-col items-center gap-2 min-w-[72px] group">
             <div class="relative overflow-hidden transition-colors border size-14 rounded-xl bg-[#102216] border-white/10 group-hover:border-[#13ec5b]/50">
                <div class="flex items-center justify-center w-full h-full bg-white/5">
                   <span class="text-gray-500 material-symbols-outlined">water_drop</span>
                </div>
                <div class="absolute bottom-0 right-0 px-1 text-[10px] font-bold text-[#102216] rounded-tl bg-[#13ec5b]">+</div>
             </div>
             <span class="text-[10px] font-medium text-gray-400 truncate w-full text-center">飲水</span>
          </button>
          <!-- Custom -->
          <button @click="router.push('/scan')" class="flex flex-col items-center gap-2 min-w-[72px] group">
             <div class="flex items-center justify-center transition-all border border-dashed border-white/20 size-14 rounded-xl group-hover:border-[#13ec5b]/50 group-hover:bg-[#13ec5b]/10 text-gray-500 group-hover:text-[#13ec5b]">
                <span class="material-symbols-outlined">add</span>
             </div>
             <span class="text-[10px] font-medium text-gray-500 truncate w-full text-center">自訂</span>
          </button>
       </div>
    </div>

  </div>
</template>

<style scoped>
@keyframes scan {
    0% { top: 0%; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { top: 100%; opacity: 0; }
}
.scan-line {
    animation: scan 3s linear infinite;
}
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
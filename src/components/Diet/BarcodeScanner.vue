<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'

const emit = defineEmits(['close', 'scanned'])

const scannerRef = ref(null)
let html5Qrcode = null
const error = ref('')

onMounted(() => {
  if (!scannerRef.value) return

  html5Qrcode = new Html5Qrcode(scannerRef.value.id)
  const config = { fps: 10, qrbox: { width: 280, height: 150 } }

  const onScanSuccess = (decodedText, decodedResult) => {
    // 停止掃描並發送結果
    html5Qrcode.stop().then(() => {
      emit('scanned', decodedText)
      emit('close')
    }).catch(err => {
      console.error("停止掃描失敗", err)
      emit('scanned', decodedText) // 即使停止失敗，依然發送結果
      emit('close')
    });
  }

  // 啟動相機掃描
  html5Qrcode.start({ facingMode: "environment" }, config, onScanSuccess, (errorMessage) => { /* 忽略掃描失敗 */ })
    .catch(err => {
      error.value = `無法啟動相機：${err.message}。請確認已授權相機權限。`
      console.error("無法啟動掃描", err)
    })
})

onUnmounted(() => {
  if (html5Qrcode && html5Qrcode.isScanning) {
    html5Qrcode.stop().catch(err => console.error("元件卸載時停止掃描失敗", err))
  }
})
</script>

<template>
  <div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
    <div id="barcode-scanner-view" ref="scannerRef" class="w-full h-full"></div>
    
    <div v-if="error" class="absolute p-4 text-white bg-red-800 rounded-lg bottom-20">
      {{ error }}
    </div>

    <button @click="$emit('close')" class="absolute btn btn-circle top-4 right-4">
      ✕
    </button>
    
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="w-[280px] h-[150px] border-4 border-dashed border-green-500 rounded-lg opacity-50 shadow-lg"></div>
    </div>
  </div>
</template>
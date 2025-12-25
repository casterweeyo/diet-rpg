<script setup>
import { useRouter } from 'vue-router'
import CustomFood from '../components/Diet/CustomFood.vue'

const router = useRouter()

const handleClose = () => {
  router.push('/')
}
</script>

<template>
  <div class="max-w-xl min-h-screen p-4 mx-auto text-white bg-gray-900">
    <div class="relative w-full p-6 bg-gray-800 border border-gray-700 shadow-2xl rounded-xl">
      
      <button @click="handleClose" class="absolute text-gray-400 top-4 right-4 hover:text-white">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <h1 class="mb-6 text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
        自訂常用飲食
      </h1>
      
      <!-- 引入管理元件 -->
      <CustomFood />
    </div>
  </div>
</template>
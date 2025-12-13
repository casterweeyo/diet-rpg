<script setup>
const emit = defineEmits(['image-selected'])

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) emit('image-selected', file)
}
</script>

<template>
  <div class="relative w-full h-48 transition-all border-2 border-gray-600 border-dashed rounded-xl hover:border-green-500 hover:bg-gray-800/50 group">
    <input 
      type="file" 
      accept="image/*" 
      capture="environment"
      class="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
      @change="onFileChange"
    />
    <div class="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none group-hover:text-green-400">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span class="font-bold">點擊拍照或上傳</span>
    </div>
  </div>
</template>
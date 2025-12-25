<script setup>
import { ref } from 'vue'
import { useUserStore } from '../../stores/userStore'

const userStore = useUserStore()
const newItem = ref({ name: '', calories: '', protein: '', carbs: '', fat: '' })

const addQuickItem = () => {
  if (!newItem.value.name || !newItem.value.calories) return
  
  // 確保陣列存在
  if (!userStore.settings.quickAddItems) {
    userStore.settings.quickAddItems = []
  }
  
  userStore.settings.quickAddItems.push({ 
    ...newItem.value, 
    icon: 'fastfood' 
  })
  
  // 清空輸入
  newItem.value = { name: '', calories: '', protein: '', carbs: '', fat: '' }
}

const removeQuickItem = (index) => {
  userStore.settings.quickAddItems.splice(index, 1)
}
</script>

<template>
  <div class="p-4 space-y-4 border border-gray-700 bg-gray-900/50 rounded-xl">
    <h3 class="text-sm font-bold text-gray-300">自訂常用飲食管理</h3>
    
    <!-- 列表 -->
    <div class="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
      <div v-for="(item, index) in userStore.settings.quickAddItems" :key="index" class="flex items-center justify-between p-2 bg-gray-800 rounded-lg">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-gray-500">{{ item.icon || 'fastfood' }}</span>
          <div>
            <div class="text-sm font-bold text-white">{{ item.name }}</div>
            <div class="text-xs text-gray-500">{{ item.calories }} kcal (P:{{ item.protein }} C:{{ item.carbs }} F:{{ item.fat }})</div>
          </div>
        </div>
        <button type="button" @click="removeQuickItem(index)" class="text-red-400 hover:text-red-300">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
      <div v-if="!userStore.settings.quickAddItems?.length" class="text-xs text-center text-gray-500 py-2">
        尚無自訂項目
      </div>
    </div>

    <!-- 新增表單 -->
    <div class="grid grid-cols-6 gap-2 pt-2 border-t border-gray-700">
      <input v-model="newItem.name" type="text" placeholder="名稱" class="col-span-2 text-sm bg-gray-800 input input-bordered input-sm" />
      <input v-model="newItem.calories" type="number" placeholder="熱量" class="col-span-1 text-sm bg-gray-800 input input-bordered input-sm" />
      <input v-model="newItem.protein" type="number" placeholder="P" class="col-span-1 text-sm bg-gray-800 input input-bordered input-sm" />
      <input v-model="newItem.carbs" type="number" placeholder="C" class="col-span-1 text-sm bg-gray-800 input input-bordered input-sm" />
      <input v-model="newItem.fat" type="number" placeholder="F" class="col-span-1 text-sm bg-gray-800 input input-bordered input-sm" />
    </div>
    <button type="button" @click="addQuickItem" class="w-full btn btn-sm btn-outline border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
      + 新增項目
    </button>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}
</style>
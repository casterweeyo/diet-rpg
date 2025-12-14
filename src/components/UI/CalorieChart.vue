<script setup>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { computed } from 'vue'
import { useDiaryStore } from '../../stores/diaryStore'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const diaryStore = useDiaryStore()

const chartData = computed(() => {
  // 1. 將紀錄依照日期分組並加總熱量
  const logsByDate = {}
  // 確保依照時間排序
  const sortedLogs = [...diaryStore.logs].sort((a, b) => a.timestamp - b.timestamp)
  
  sortedLogs.forEach(log => {
    if (!logsByDate[log.date]) {
      logsByDate[log.date] = 0
    }
    logsByDate[log.date] += (log.calories || 0)
  })

  // 2. 取出最近 7 天的資料 (如果資料少於 7 天則顯示全部)
  const dates = Object.keys(logsByDate).slice(-7)
  const calories = dates.map(date => logsByDate[date])

  return {
    labels: dates.map(d => d.slice(5)), // 只顯示 MM-DD
    datasets: [
      {
        label: '熱量攝取 (kcal)',
        backgroundColor: '#10b981', // Emerald-500
        borderColor: '#10b981',
        data: calories,
        tension: 0.4,
        pointBackgroundColor: '#34d399',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#34d399'
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(17, 24, 39, 0.9)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#374151',
      borderWidth: 1
    }
  },
  scales: {
    y: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } },
    x: { grid: { display: false }, ticks: { color: '#9ca3af' } }
  }
}
</script>

<template>
  <div class="h-48">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
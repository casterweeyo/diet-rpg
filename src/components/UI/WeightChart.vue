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
import { useUserStore } from '../../stores/userStore'

// 註冊 Chart.js 元件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const userStore = useUserStore()

// 準備圖表資料
const chartData = computed(() => {
  // 如果沒有紀錄，顯示空資料或預設值
  const history = userStore.weightHistory.length > 0 
    ? userStore.weightHistory 
    : [{ date: 'Today', weight: userStore.profile.weight }]

  return {
    labels: history.map(h => h.date.slice(5)), // 只顯示 MM-DD
    datasets: [
      {
        label: '體重 (kg)',
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        data: history.map(h => h.weight),
        tension: 0.4, // 曲線平滑度
        pointBackgroundColor: '#60a5fa',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#60a5fa'
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
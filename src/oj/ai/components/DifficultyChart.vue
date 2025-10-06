<template>
  <n-card title="难度统计" size="small" v-if="show">
    <Bar :data="data" :options="options" />
  </n-card>
</template>
<script setup lang="ts">
import { Bar } from "vue-chartjs"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors,
} from "chart.js"
import { useAIStore } from "oj/store/ai"

// 仅注册柱状图所需的 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Colors,
)

const aiStore = useAIStore()

const show = computed(() => {
  return (
    Object.values(aiStore.detailsData.difficulty).reduce((a, b) => a + b, 0) > 0
  )
})

const data = computed(() => {
  return {
    labels: Object.keys(aiStore.detailsData.difficulty),
    datasets: [
      {
        data: Object.values(aiStore.detailsData.difficulty),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  }
})

const options = {
  interaction: {
    intersect: false,
  },
  maintainAspectRatio: false,
  scales: {
    y: {
      ticks: {
        stepSize: 1,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
}
</script>

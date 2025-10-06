<template>
  <n-card :title="title" size="small" v-if="show">
    <div class="chart">
      <Pie :data="data" :options="options" />
    </div>
  </n-card>
</template>
<script setup lang="ts">
import { Pie } from "vue-chartjs"
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Colors,
} from "chart.js"
import { useAIStore } from "oj/store/ai"

// 仅注册饼图所需的 Chart.js 组件
ChartJS.register(ArcElement, Title, Tooltip, Legend, Colors)

const aiStore = useAIStore()

const show = computed(() => {
  return Object.keys(aiStore.detailsData.tags).length > 0
})

const title = computed(() => {
  return `标签分布（前${Object.keys(aiStore.detailsData.tags).length}个）`
})

const data = computed(() => {
  return {
    labels: Object.keys(aiStore.detailsData.tags),
    datasets: [
      {
        data: Object.values(aiStore.detailsData.tags),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
      },
    ],
  }
})

const options = computed(() => {
  return {
    interaction: {
      intersect: false,
    },
    maintainAspectRatio: false,
  }
})
</script>
<style scoped>
.chart {
  height: 100%;
  width: 100%;
}
</style>

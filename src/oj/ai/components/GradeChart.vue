<template>
  <n-card title="等级统计" size="small" v-if="show">
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
import { Grade } from "utils/types"
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

const gradeOrder = ["S", "A", "B", "C"]

const grades = computed(() =>
  aiStore.detailsData.solved.map((item) => item.grade),
)

// 统计每个等级的题目数量
const gradeCount = computed(() => {
  const count: { [key: string]: number } = {
    C: 0,
    B: 0,
    A: 0,
    S: 0,
  }
  grades.value.forEach((grade) => {
    if (grade && grade in count) {
      count[grade]++
    }
  })
  return count
})

const show = computed(() => {
  return grades.value.length > 0
})

const data = computed(() => {
  return {
    labels: gradeOrder,
    datasets: [
      {
        data: gradeOrder.map((grade) => gradeCount.value[grade]),
        backgroundColor: ["#FF6384", "#FFCE56", "#36A2EB", "#95F204"],
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

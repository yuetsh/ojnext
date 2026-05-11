<template>
  <div class="yearly-chart" v-if="props.data.length > 1">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { Line } from "vue-chartjs"
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js"
import type { YearlyACData } from "oj/api"

ChartJS.register(
  CategoryScale,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
)

const props = defineProps<{ data: YearlyACData[] }>()

const chartData = computed(() => ({
  labels: props.data.map((d) => String(d.year)),
  datasets: [
    {
      label: "AC 率",
      data: props.data.map((d) => d.ac_rate),
      fill: true,
      tension: 0.3,
      backgroundColor: "rgba(99, 179, 237, 0.2)",
      borderColor: "rgba(99, 179, 237, 1)",
      pointBackgroundColor: "rgba(99, 179, 237, 1)",
    },
  ],
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: "历年 AC 率",
      font: { size: 20 },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const d = props.data[context.dataIndex]
          return [`AC 率: ${d.ac_rate}%`, `通过: ${d.accepted} / ${d.total}`]
        },
      },
    },
  },
  scales: {
    y: {
      min: 0,
      max: 100,
      ticks: {
        callback: (value: any) => `${value}%`,
      },
    },
  },
}))
</script>

<style scoped>
.yearly-chart {
  width: 100%;
  max-width: 500px;
  height: 250px;
  margin: 24px auto;
}
</style>

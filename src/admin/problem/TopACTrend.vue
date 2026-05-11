<script setup lang="ts">
import { Line } from "vue-chartjs"
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js"
import { getTopACTrend } from "admin/api"

ChartJS.register(
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
)

interface YearlyEntry {
  year: number
  total: number
  accepted: number
  ac_rate: number
}

interface ProblemTrend {
  problem_id: string
  problem_title: string
  yearly: YearlyEntry[]
}

const COLORS = [
  "#4e79a7",
  "#f28e2b",
  "#e15759",
  "#76b7b2",
  "#59a14f",
  "#edc948",
  "#b07aa1",
  "#ff9da7",
  "#9c755f",
  "#bab0ac",
]

const loading = ref(true)
const data = ref<ProblemTrend[]>([])

const allYears = computed(() => {
  const years = new Set<number>()
  data.value.forEach((p) => p.yearly.forEach((y) => years.add(y.year)))
  return Array.from(years).sort()
})

const chartData = computed(() => ({
  labels: allYears.value.map(String),
  datasets: data.value.map((problem, i) => {
    const byYear = new Map(problem.yearly.map((y) => [y.year, y]))
    return {
      label: `${problem.problem_id} ${problem.problem_title}`,
      data: allYears.value.map((year) => byYear.get(year)?.ac_rate ?? null),
      borderColor: COLORS[i % COLORS.length],
      backgroundColor: COLORS[i % COLORS.length] + "33",
      tension: 0.3,
      spanGaps: false,
      pointRadius: 4,
    }
  }),
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    title: {
      display: true,
      text: "提交次数前 10 题目 · 历年 AC 率",
      font: { size: 18 },
    },
    legend: {
      position: "bottom" as const,
      labels: { boxWidth: 12, padding: 12 },
    },
    tooltip: {
      callbacks: {
        label: (ctx: any) => {
          const problem = data.value[ctx.datasetIndex]
          const year = allYears.value[ctx.dataIndex]
          const entry = problem.yearly.find((y) => y.year === year)
          if (!entry) return `${ctx.dataset.label}: 无数据`
          return `${ctx.dataset.label}: ${entry.ac_rate}% (${entry.accepted}/${entry.total})`
        },
      },
    },
  },
  scales: {
    y: {
      min: 0,
      max: 100,
      ticks: { callback: (v: any) => `${v}%` },
      title: { display: true, text: "AC 率" },
    },
    x: {
      title: { display: true, text: "年份" },
    },
  },
}

onMounted(async () => {
  try {
    const res = await getTopACTrend()
    data.value = res.data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <h2 style="margin-top: 0">提交次数前 10 题目 · 历年 AC 率趋势</h2>
  <n-spin :show="loading">
    <div v-if="!loading && data.length === 0" style="text-align: center; padding: 40px">
      暂无数据
    </div>
    <div v-else class="chart-wrapper">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </n-spin>
</template>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 500px;
  padding: 16px 0;
}
</style>

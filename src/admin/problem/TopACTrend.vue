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
import { getTopACTrend } from "admin/api"

ChartJS.register(
  CategoryScale,
  Filler,
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

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: currentYear - 2022 + 1 }, (_, i) => ({
  label: String(2022 + i),
  value: 2022 + i,
}))
const minPerYearOptions = [
  { label: "50", value: 50 },
  { label: "100", value: 100 },
  { label: "200", value: 200 },
]

const sinceYear = ref(2023)
const untilYear = ref(new Date().getFullYear()-1)
const minPerYear = ref(100)
const loading = ref(false)
const data = ref<ProblemTrend[]>([])

const acLabelPlugin = {
  id: "acLabel",
  afterDatasetsDraw(chart: any) {
    const ctx = chart.ctx
    chart.data.datasets.forEach((_: any, i: number) => {
      const meta = chart.getDatasetMeta(i)
      meta.data.forEach((point: any, j: number) => {
        const value = chart.data.datasets[i].data[j]
        if (value === null || value === undefined) return
        ctx.save()
        ctx.font = "bold 11px sans-serif"
        ctx.fillStyle = "rgba(99, 179, 237, 1)"
        ctx.textAlign = "center"
        ctx.textBaseline = "bottom"
        ctx.fillText(`${value}%`, point.x, point.y - 6)
        ctx.restore()
      })
    })
  },
}

function getChartData(problem: ProblemTrend) {
  return {
    labels: problem.yearly.map((y) => String(y.year)),
    datasets: [
      {
        label: "AC 率",
        data: problem.yearly.map((y) => y.ac_rate),
        fill: true,
        tension: 0.3,
        backgroundColor: "rgba(99, 179, 237, 0.2)",
        borderColor: "rgba(99, 179, 237, 1)",
        pointBackgroundColor: "rgba(99, 179, 237, 1)",
        pointRadius: 4,
      },
    ],
  }
}

function getChartOptions(problem: ProblemTrend) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `${problem.problem_id} · ${problem.problem_title}`,
        font: { size: 14 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const entry = problem.yearly[ctx.dataIndex]
            return `AC 率: ${entry.ac_rate}% (${entry.accepted}/${entry.total})`
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { callback: (v: any) => `${v}%` },
      },
      x: {
        title: { display: true, text: "年份" },
      },
    },
  }
}

async function fetchData() {
  loading.value = true
  try {
    const res = await getTopACTrend({ since_year: sinceYear.value, until_year: untilYear.value, min_per_year: minPerYear.value })
    data.value = res.data
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <h2 style="margin-top: 0">年度趋势</h2>
  <n-space align="center" style="margin-bottom: 16px">
    <span>年份范围</span>
    <n-select
      v-model:value="sinceYear"
      :options="yearOptions"
      style="width: 100px"
      @update:value="fetchData"
    />
    <span>—</span>
    <n-select
      v-model:value="untilYear"
      :options="yearOptions"
      style="width: 100px"
      @update:value="fetchData"
    />
    <span>年提交下限</span>
    <n-select
      v-model:value="minPerYear"
      :options="minPerYearOptions"
      style="width: 90px"
      @update:value="fetchData"
    />
    <n-tag type="info" size="small">共 {{ data.length }} 题</n-tag>
  </n-space>
  <n-spin :show="loading">
    <div
      v-if="!loading && data.length === 0"
      style="text-align: center; padding: 40px"
    >
      暂无数据
    </div>
    <div v-else class="grid">
      <div v-for="problem in data" :key="problem.problem_id" class="chart-card">
        <Line :data="getChartData(problem)" :options="getChartOptions(problem)" :plugins="[acLabelPlugin]" />
      </div>
    </div>
  </n-spin>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  padding: 8px 0;
}

.chart-card {
  height: 260px;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
</style>

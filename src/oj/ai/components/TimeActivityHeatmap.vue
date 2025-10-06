<template>
  <n-card title="时间活跃度分析" size="small" v-if="show">
    <template #header-extra>
      <n-text depth="3" style="font-size: 12px">
        发现最佳学习时段
      </n-text>
    </template>
    <div style="height: 300px">
      <Bar :data="data" :options="options" />
    </div>
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
} from "chart.js"
import { useAIStore } from "oj/store/ai"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const aiStore = useAIStore()

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]
const TIME_PERIODS = [
  { label: "凌晨(0-6)", start: 0, end: 6 },
  { label: "上午(6-12)", start: 6, end: 12 },
  { label: "下午(12-18)", start: 12, end: 18 },
  { label: "晚上(18-24)", start: 18, end: 24 },
]

// 统计每个星期几和时间段的做题数量
const activityMatrix = computed(() => {
  const matrix: { [weekday: number]: { [period: number]: number } } = {}

  // 初始化矩阵
  for (let i = 0; i < 7; i++) {
    matrix[i] = {}
    for (let j = 0; j < TIME_PERIODS.length; j++) {
      matrix[i][j] = 0
    }
  }

  // 统计数据
  aiStore.detailsData.solved.forEach((item) => {
    const date = new Date(item.ac_time)
    const weekday = date.getDay() // 0-6，0是周日
    const hour = date.getHours() // 0-23

    // 找到对应的时间段
    const periodIndex = TIME_PERIODS.findIndex(
      (p) => hour >= p.start && hour < p.end,
    )
    if (periodIndex !== -1) {
      matrix[weekday][periodIndex]++
    }
  })

  return matrix
})

const show = computed(() => {
  return aiStore.detailsData.solved.length > 0
})

// 为每个时间段准备数据集
const data = computed(() => {
  const datasets = TIME_PERIODS.map((period, periodIndex) => {
    return {
      label: period.label,
      data: WEEKDAYS.map((_, weekday) => activityMatrix.value[weekday][periodIndex]),
      backgroundColor: getTimePeriodColor(periodIndex),
      borderColor: getTimePeriodColor(periodIndex),
      borderWidth: 1,
    }
  })

  return {
    labels: WEEKDAYS,
    datasets,
  }
})

// 根据时间段返回对应的颜色
function getTimePeriodColor(periodIndex: number): string {
  const colors = [
    "#9D9D9D", // 凌晨 - 灰色
    "#FFD700", // 上午 - 金色
    "#4ECDC4", // 下午 - 青色
    "#5B5F97", // 晚上 - 深蓝紫
  ]
  return colors[periodIndex] || "#999"
}

const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: "index" as const,
  },
  scales: {
    x: {
      stacked: true,
      grid: {
        display: false,
      },
    },
    y: {
      stacked: true,
      ticks: {
        stepSize: 1,
      },
      title: {
        display: true,
        text: "完成题目数",
      },
    },
  },
  plugins: {
    legend: {
      display: true,
      position: "bottom" as const,
      labels: {
        boxWidth: 12,
        padding: 8,
        font: {
          size: 11,
        },
      },
    },
    title: {
      display: false,
    },
    tooltip: {
      callbacks: {
        footer: (items: any[]) => {
          const total = items.reduce((sum, item) => sum + item.parsed.y, 0)
          return `当天总计: ${total} 题`
        },
      },
    },
  },
}
</script>


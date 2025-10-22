<template>
  <n-card title="前10名题目通过时间" v-if="hasData">
    <div class="chart">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </n-card>
</template>
<script setup lang="ts">
import { Line } from "vue-chartjs"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { ContestRank } from "utils/types"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
)

interface Props {
  ranks: ContestRank[]
  problems?: Array<{ id: number; title: string }>
}

const props = defineProps<Props>()

// 判断是否有数据
const hasData = computed(() => {
  return props.ranks && props.ranks.length > 0
})

// 预定义的颜色方案 - 更现代和可访问的颜色
const colorPalette = [
  "#3B82F6", // 蓝色
  "#EF4444", // 红色
  "#10B981", // 绿色
  "#F59E0B", // 黄色
  "#8B5CF6", // 紫色
  "#EC4899", // 粉色
  "#06B6D4", // 青色
  "#84CC16", // 青绿色
  "#F97316", // 橙色
  "#6366F1", // 靛蓝色
]

// 数据处理函数
const processChartData = () => {
  if (!props.ranks || props.ranks.length === 0) {
    return {
      labels: [],
      datasets: [],
    }
  }

  // 获取前10名用户的数据
  const topUsers = props.ranks.slice(0, 10)

  // 获取所有题目ID（从所有用户的submission_info中收集）
  const allProblemIds = new Set<string>()
  topUsers.forEach((rank) => {
    Object.keys(rank.submission_info).forEach((problemId) => {
      allProblemIds.add(problemId)
    })
  })

  // 按题目ID排序
  const problemIds = Array.from(allProblemIds).sort()

  // 创建题目标签
  const labels = problemIds.map((id) => {
    if (props.problems) {
      const problem = props.problems.find((p) => p.id.toString() === id)
      return problem ? problem.title : `题目${id}`
    }
    return `题目${id}`
  })

  // 找到所有用户中最早的提交时间
  let earliestTime = Infinity
  topUsers.forEach((rank) => {
    Object.values(rank.submission_info).forEach((submissionInfo) => {
      if (submissionInfo.is_ac && submissionInfo.ac_time < earliestTime) {
        earliestTime = submissionInfo.ac_time
      }
    })
  })

  // 如果没有找到任何通过记录，使用0作为基准
  if (earliestTime === Infinity) {
    earliestTime = 0
  }

  // 为每个用户创建数据集
  const datasets = topUsers.map((rank, userIndex) => {
    const userData = problemIds.map((problemId) => {
      const submissionInfo = rank.submission_info[problemId]
      if (!submissionInfo || !submissionInfo.is_ac) {
        return null
      }
      return submissionInfo.ac_time - earliestTime
    })

    const actualRank = userIndex + 1
    const colorIndex = userIndex % colorPalette.length
    const color = colorPalette[colorIndex]

    return {
      label: `第${actualRank}名: ${rank.user.username}`,
      data: userData,
      borderColor: color,
      backgroundColor: color + "20",
      tension: 0.3,
      fill: false,
      pointRadius: 6,
      pointHoverRadius: 8,
      pointBackgroundColor: color,
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      spanGaps: false,
    }
  })

  return {
    labels,
    datasets,
  }
}

// 监听数据变化，重新处理
watch(
  () => [props.ranks, props.problems],
  () => {
    if (props.ranks && props.ranks.length > 0) {
      // 数据变化时重新处理
    }
  },
  { deep: true, immediate: true },
)

const chartData = computed(() => {
  return processChartData()
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "top" as const,
      maxHeight: 80,
      labels: {
        boxWidth: 12,
        boxHeight: 12,
        padding: 8,
        usePointStyle: true,
        font: {
          size: 11,
        },
      },
    },
    tooltip: {
      mode: "index" as const,
      intersect: false,
      callbacks: {
        title: function (context: any) {
          return `题目: ${context[0].label}`
        },
        label: function (context: any) {
          const value = context.parsed.y
          const label = context.dataset.label

          if (value === null) {
            return `${label}: 未通过`
          }

          const hours = Math.floor(value / 3600)
          const minutes = Math.floor((value % 3600) / 60)
          const seconds = Math.floor(value % 60)

          let timeStr = ""
          if (hours > 0) timeStr += `${hours}小时`
          if (minutes > 0) timeStr += `${minutes}分钟`
          if (seconds > 0 || timeStr === "") timeStr += `${seconds}秒`

          return `${label}: +${timeStr}`
        },
      },
    },
  },
  scales: {
    y: {
      title: {
        display: true,
        text: "相对通过时间",
      },
      min: 0,
      ticks: {
        callback: function (value: any) {
          const hours = Math.floor(value / 3600)
          const minutes = Math.floor((value % 3600) / 60)
          const seconds = Math.floor(value % 60)

          if (hours > 0) return `+${hours}h${minutes}m`
          if (minutes > 0) return `+${minutes}m${seconds}s`
          return `+${seconds}s`
        },
      },
    },
  },
}))
</script>

<style scoped>
.chart {
  height: 500px;
  width: 100%;
}
</style>

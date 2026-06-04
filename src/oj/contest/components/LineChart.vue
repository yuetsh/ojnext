<template>
  <div class="chart" v-if="showChart">
    <Line :data="chartData" :options="chartOptions" />
  </div>
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
  problems: Array<{ id: number; title: string }>
}

const props = defineProps<Props>()

const PENALTY_SECONDS = 20 * 60

const showChart = computed(() => {
  const hasRanks = props.ranks.length > 0
  const hasProblems = props.problems.length >= 3
  return hasProblems && hasRanks
})

const colorPalette = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
]

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h${m}m`
  return `${m}m`
}

interface AcEvent {
  time: number
  userIndex: number
  problemId: string
}

const chartData = computed(() => {
  if (!props.ranks || props.ranks.length === 0) {
    return { labels: [], datasets: [] }
  }

  const topUsers = props.ranks.slice(0, 10)

  // 收集所有AC事件并按时间排序
  const events: AcEvent[] = []
  topUsers.forEach((rank, userIndex) => {
    Object.entries(rank.submission_info).forEach(([problemId, info]) => {
      if (info.is_ac) {
        events.push({ time: info.ac_time, userIndex, problemId })
      }
    })
  })
  events.sort((a, b) => a.time - b.time)

  if (events.length === 0) {
    return { labels: [], datasets: [] }
  }

  // 在每个时间点计算所有人的排名
  // 状态: 每个用户当前已AC题数和罚时
  const userState = topUsers.map(() => ({
    solved: 0,
    penalty: 0,
  }))

  // 用于记录每个用户每道题的错误次数
  const userErrors: Map<string, number>[] = topUsers.map(() => new Map())
  topUsers.forEach((rank, i) => {
    Object.entries(rank.submission_info).forEach(([problemId, info]) => {
      if (info.error_number > 0) {
        userErrors[i].set(problemId, info.error_number)
      }
    })
  })

  function calcRanks(): number[] {
    const indexed = userState.map((s, i) => ({ ...s, i }))
    indexed.sort((a, b) => {
      if (b.solved !== a.solved) return b.solved - a.solved
      return a.penalty - b.penalty
    })
    const ranks = new Array(topUsers.length).fill(0)
    indexed.forEach((item, pos) => {
      ranks[item.i] = pos + 1
    })
    return ranks
  }

  // 时间轴上的数据点: [时间标签, 各用户排名]
  const timePoints: number[] = [0]
  const rankSnapshots: number[][] = [calcRanks()]

  // 按时间处理事件（合并同一时刻的事件）
  let i = 0
  while (i < events.length) {
    const currentTime = events[i].time
    // 处理同一时刻的所有事件
    while (i < events.length && events[i].time === currentTime) {
      const ev = events[i]
      userState[ev.userIndex].solved++
      const errors = userErrors[ev.userIndex].get(ev.problemId) || 0
      userState[ev.userIndex].penalty =
        userState[ev.userIndex].penalty + ev.time + errors * PENALTY_SECONDS
      i++
    }
    timePoints.push(currentTime)
    rankSnapshots.push(calcRanks())
  }

  const labels = timePoints.map((t) => formatTime(t))

  const datasets = topUsers.map((rank, userIndex) => {
    const color = colorPalette[userIndex % colorPalette.length]
    const finalRank = rankSnapshots[rankSnapshots.length - 1][userIndex]
    return {
      label: `#${finalRank} ${rank.user.username}`,
      data: rankSnapshots.map((snapshot) => snapshot[userIndex]),
      borderColor: color,
      backgroundColor: color,
      tension: 0.3,
      fill: false,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: color,
      pointBorderColor: "#fff",
      pointBorderWidth: 1,
      borderWidth: 2.5,
    }
  })

  return { labels, datasets }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index" as const,
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      position: "top" as const,
      maxHeight: 80,
      labels: {
        boxWidth: 14,
        boxHeight: 3,
        padding: 10,
        font: { size: 12 },
      },
    },
    tooltip: {
      mode: "index" as const,
      intersect: false,
      itemSort: (a: any, b: any) => a.parsed.y - b.parsed.y,
      callbacks: {
        title: (context: any) => `比赛进行: ${context[0].label}`,
        label: (context: any) => {
          const rank = context.parsed.y
          const name = context.dataset.label
          return `  第${rank}名 — ${name}`
        },
      },
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: "比赛时间",
      },
    },
    y: {
      title: {
        display: true,
        text: "排名",
      },
      reverse: true,
      min: 1,
      max: 10,
      ticks: {
        stepSize: 1,
        callback: (value: any) => `第${value}名`,
      },
    },
  },
}))
</script>

<style scoped>
.chart {
  height: 420px;
  width: 100%;
  margin-bottom: 24px;
}
</style>

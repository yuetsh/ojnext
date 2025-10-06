<template>
  <n-card :title="title" size="small" v-if="show">
    <div class="chart">
      <Chart type="line" :data="data" :options="options" />
    </div>
  </n-card>
</template>
<script setup lang="ts">
import type { ChartData, ChartOptions, TooltipItem } from "chart.js"
import { Chart } from "vue-chartjs"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Colors,
  Filler,
} from "chart.js"
import { useAIStore } from "oj/store/ai"
import { parseTime } from "utils/functions"
import type { Grade } from "utils/types"

// 注册折线图所需的 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Colors,
  Filler,
)

const aiStore = useAIStore()

const gradeOrder = ["C", "B", "A", "S"] as const
const gradeColors: Record<Grade, string> = {
  C: "#95F204",
  B: "#36A2EB",
  A: "#FFCE56",
  S: "#FF6384",
}

const title = computed(() => {
  const durationMap: Record<string, string> = {
    "hours:1": "一节课内",
    "hours:2": "两节课内",
    "days:1": "一天内",
    "weeks:1": "一周内",
    "months:1": "一个月内",
    "months:2": "两个月内",
    "months:6": "半年内",
    "years:1": "一年内",
  }
  const label = durationMap[aiStore.duration] || ""
  return label ? `${label}做题的进步曲线` : "做题的进步曲线"
})

// 判断是否有数据
const show = computed(() => {
  return aiStore.detailsData.solved.length > 0
})

// 按时间排序的题目列表
const sortedProblems = computed(() => {
  return [...aiStore.detailsData.solved].sort(
    (a, b) => new Date(a.ac_time).getTime() - new Date(b.ac_time).getTime(),
  )
})

// 计算累计题目数量和等级趋势
const progressData = computed(() => {
  const problems = sortedProblems.value
  let cumulativeCount = 0
  const gradeValues: { [key: string]: number } = { C: 0, B: 0, A: 0, S: 0 }

  return problems.map((problem) => {
    cumulativeCount++
    const grade = problem.grade || "C"
    gradeValues[grade]++

    // 计算平均等级（加权平均）
    let totalWeight = 0
    let weightedSum = 0
    for (const [g, count] of Object.entries(gradeValues)) {
      totalWeight += count
      weightedSum += gradeOrder.indexOf(g as Grade) * count
    }
    const avgGrade = totalWeight > 0 ? weightedSum / totalWeight : 0

    return {
      time: parseTime(problem.ac_time, "M/D"),
      fullTime: parseTime(problem.ac_time, "YYYY-MM-DD HH:mm:ss"),
      count: cumulativeCount,
      grade: problem.grade || "C",
      avgGrade: avgGrade,
      problem: problem.problem,
    }
  })
})

// 图表数据
const data = computed<ChartData<"line">>(() => {
  const progress = progressData.value

  return {
    labels: progress.map((p) => p.time),
    datasets: [
      {
        type: "line",
        label: "累计完成题目",
        data: progress.map((p) => p.count),
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        tension: 0.3,
        yAxisID: "y",
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
      {
        type: "line",
        label: "平均等级",
        data: progress.map((p) => p.avgGrade),
        borderColor: "#FF9800",
        backgroundColor: "rgba(255, 152, 0, 0.1)",
        tension: 0.3,
        yAxisID: "y1",
        fill: false,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        pointBackgroundColor: progress.map((p) => gradeColors[p.grade]),
        pointBorderColor: progress.map((p) => gradeColors[p.grade]),
        pointBorderWidth: 2,
      },
    ],
  }
})

// 图表配置
const options = computed<ChartOptions<"line">>(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 15,
        },
      },
      y: {
        type: "linear",
        position: "left",
        title: {
          display: true,
          text: "累计题目数",
          font: {
            size: 14,
          },
        },
        ticks: {
          stepSize: 1,
        },
        beginAtZero: true,
      },
      y1: {
        type: "linear",
        position: "right",
        min: -0.5,
        max: gradeOrder.length - 0.5,
        title: {
          display: true,
          text: "平均等级",
          font: {
            size: 14,
          },
        },
        ticks: {
          stepSize: 1,
          callback: (v) => {
            const idx = Math.round(Number(v))
            return gradeOrder[idx] || ""
          },
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (items: TooltipItem<"line">[]) => {
            if (items.length > 0) {
              const idx = items[0].dataIndex
              return progressData.value[idx]?.fullTime || ""
            }
            return ""
          },
          label: (ctx: TooltipItem<"line">) => {
            const dsLabel = ctx.dataset.label || ""
            const idx = ctx.dataIndex

            if ((ctx.dataset as any).yAxisID === "y1") {
              const progress = progressData.value[idx]
              if (progress) {
                const avgIdx = Math.round(Number(ctx.parsed.y))
                return [
                  `${dsLabel}: ${gradeOrder[avgIdx] || ""}`,
                  `当前题目等级: ${progress.grade}`,
                  `题目: ${progress.problem.title}`,
                ]
              }
            } else {
              return `${dsLabel}: ${ctx.formattedValue}`
            }
            return `${dsLabel}: ${ctx.formattedValue}`
          },
        },
      },
      legend: {
        display: true,
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
    },
  }
})
</script>
<style scoped>
.chart {
  height: 300px;
  width: 100%;
}
</style>

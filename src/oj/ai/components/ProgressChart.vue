<template>
  <n-card :title="title" size="small" v-if="show">
    <template #header-extra>
      <n-text depth="3" style="font-size: 12px">
        追踪学习成长轨迹
      </n-text>
    </template>
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
  if (aiStore.duration === "months:2") {
    return "过去两个月的进步曲线"
  } else if (aiStore.duration === "months:6") {
    return "过去半年的进步曲线"
  } else if (aiStore.duration === "years:1") {
    return "过去一年的进步曲线"
  } else {
    return "过去四周的进步曲线"
  }
})

// 判断是否有数据
const show = computed(() => {
  return aiStore.durationData.length > 0
})

// 计算累计题目数量和等级趋势
const progressData = computed(() => {
  let cumulativeCount = 0
  let totalWeightedGrade = 0 // 累计加权等级
  let totalProblems = 0 // 累计题目总数

  return aiStore.durationData.map((duration) => {
    const problemCount = duration.problem_count || 0
    cumulativeCount += problemCount

    // 计算本期等级的权重值
    const currentGradeValue = gradeOrder.indexOf(duration.grade || "C")
    
    // 累加加权等级
    totalWeightedGrade += currentGradeValue * problemCount
    totalProblems += problemCount

    // 计算累计平均等级
    const avgGradeValue = totalProblems > 0 ? totalWeightedGrade / totalProblems : 0

    return {
      label: [
        parseTime(duration.start, "M月D日"),
        parseTime(duration.end, "M月D日"),
      ].join("～"),
      start: parseTime(duration.start, "YYYY-MM-DD"),
      end: parseTime(duration.end, "YYYY-MM-DD"),
      count: cumulativeCount,
      grade: duration.grade || "C",
      gradeValue: currentGradeValue,
      avgGradeValue: avgGradeValue, // 累计平均等级
      problemCount: problemCount,
    }
  })
})

// 图表数据
const data = computed<ChartData<"line">>(() => {
  const progress = progressData.value

  return {
    labels: progress.map((p) => p.label),
    datasets: [
      {
        type: "line",
        label: "累计完成题目",
        data: progress.map((p) => p.count),
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        tension: 0.4,
        yAxisID: "y",
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2.5,
        pointBackgroundColor: "#4CAF50",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
      {
        type: "line",
        label: "累计平均等级",
        data: progress.map((p) => p.avgGradeValue),
        borderColor: "#FF9800",
        backgroundColor: "rgba(255, 152, 0, 0.1)",
        tension: 0.4,
        yAxisID: "y1",
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2.5,
        pointBackgroundColor: progress.map((p) => gradeColors[p.grade]),
        pointBorderColor: "#fff",
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
          text: "累计平均等级",
          font: {
            size: 14,
          },
        },
        ticks: {
          stepSize: 1,
          callback: (v: string | number) => {
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
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        callbacks: {
          title: (items: TooltipItem<"line">[]) => {
            if (items.length > 0) {
              const idx = items[0].dataIndex
              const progress = progressData.value[idx]
              return progress ? `${progress.start} ~ ${progress.end}` : ""
            }
            return ""
          },
          label: (ctx: TooltipItem<"line">) => {
            const dsLabel = ctx.dataset.label || ""
            const idx = ctx.dataIndex
            const progress = progressData.value[idx]

            if (!progress) {
              return `${dsLabel}: ${ctx.formattedValue}`
            }

            if ((ctx.dataset as any).yAxisID === "y1") {
              // 累计平均等级轴
              const avgIdx = Math.round(Number(ctx.parsed.y))
              return [
                `${dsLabel}: ${gradeOrder[avgIdx] || ""}`,
                `本期等级: ${progress.grade}`,
                `本期完成: ${progress.problemCount} 题`,
              ]
            } else {
              // 累计题目数轴
              return [
                `${dsLabel}: ${ctx.formattedValue} 题`,
                `本期完成: ${progress.problemCount} 题`,
              ]
            }
          },
        },
      },
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          padding: 8,
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

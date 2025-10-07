<template>
  <n-card :title="title" size="small">
    <template #header-extra>
      <n-text depth="3" style="font-size: 12px"> 全面评估学习情况 </n-text>
    </template>
    <div class="chart">
      <Chart type="bar" :data="data" :options="options" />
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
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Colors,
  LineController,
} from "chart.js"
import { useAIStore } from "oj/store/ai"
import { parseTime } from "utils/functions"

// 注册混合图表（Bar + Line）所需的 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Colors,
  LineController,
)

const aiStore = useAIStore()

const gradeOrder = ["C", "B", "A", "S"] as const

const title = computed(() => {
  if (aiStore.duration === "months:2") {
    return "过去两个月的每周综合情况"
  } else if (aiStore.duration === "months:6") {
    return "过去半年的每月综合情况"
  } else if (aiStore.duration === "years:1") {
    return "过去一年的每月综合情况"
  } else {
    return "过去四周的综合情况"
  }
})

const data = computed<ChartData<"bar" | "line">>(() => {
  return {
    labels: aiStore.durationData.map((duration) => {
      let prefix = "周"
      if (duration.unit === "months") {
        prefix = "月"
      }
      return [
        parseTime(duration.start, "M月D日"),
        parseTime(duration.end, "M月D日"),
      ].join("～")
    }),
    datasets: [
      {
        type: "bar",
        label: "完成题目数",
        data: aiStore.durationData.map((duration) => duration.problem_count),
        yAxisID: "y",
        order: 2,
      },
      {
        type: "bar",
        label: "总提交次数",
        data: aiStore.durationData.map((duration) => duration.submission_count),
        yAxisID: "y",
        order: 2,
      },
      {
        type: "line",
        label: "等级",
        data: aiStore.durationData.map((duration) =>
          gradeOrder.indexOf(duration.grade || "C"),
        ),
        tension: 0.4,
        yAxisID: "y1",
        barThickness: 10,
        order: 1,
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }
})

const options = computed<ChartOptions<"bar" | "line">>(() => {
  return {
    interaction: {
      intersect: false,
    },
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: "数量",
        },
        beginAtZero: true,
      },
      y1: {
        type: "linear",
        position: "right",
        min: -0.5,
        max: gradeOrder.length - 0.5,
        ticks: {
          stepSize: 1,
          callback: (v) => {
            const idx = Number(v)
            return gradeOrder[idx] || ""
          },
        },
        title: {
          display: true,
          text: "等级",
        },
        grid: {
          display: false,
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
          label: (ctx: TooltipItem<"bar">) => {
            const dsLabel = ctx.dataset.label || ""
            if ((ctx.dataset as any).yAxisID === "y1") {
              const idx = Number(ctx.parsed.y)
              return `${dsLabel}: ${gradeOrder[idx] || ""}`
            }
            return `${dsLabel}: ${ctx.formattedValue}`
          },
          footer: (items: TooltipItem<"bar">[]) => {
            const barItems = items.filter(
              (item) => (item.dataset as any).yAxisID === "y",
            )
            if (barItems.length >= 2) {
              const problemCount =
                barItems.find((item) => item.dataset.label === "完成题目数")
                  ?.parsed.y || 0
              const submissionCount =
                barItems.find((item) => item.dataset.label === "总提交次数")
                  ?.parsed.y || 0
              const efficiency =
                submissionCount > 0
                  ? ((problemCount / submissionCount) * 100).toFixed(1)
                  : "0"
              return `AC率: ${efficiency}%`
            }
            return ""
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

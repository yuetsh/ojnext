<template>
  <div class="chart">
    <Chart type="bar" :data="data" :options="options" />
  </div>
</template>
<script setup lang="ts">
import type { ChartData, ChartOptions, TooltipItem } from "chart.js"
import { Chart } from "vue-chartjs"
import { parseTime } from "~/utils/functions"
import { WeeklyData } from "~/utils/types"

const props = defineProps<{
  weeklyData: WeeklyData[]
  duration: string
}>()

const gradeOrder = ["C", "B", "A", "S"] as const

const title = computed(() => {
  if (props.duration === "months:2") {
    return "过去两个月的每周综合情况一览图"
  } else if (props.duration === "months:6") {
    return "过去半年的每月综合情况一览图"
  } else if (props.duration === "years:1") {
    return "过去一年的每月综合情况一览图"
  } else {
    return "过去四周的综合情况一览图"
  }
})

const data = computed<ChartData<"bar" | "line">>(() => {
  return {
    labels: props.weeklyData.map((weekly) => {
      let prefix = "周"
      if (weekly.unit === "months") {
        prefix = "月"
      }

      return [
        parseTime(weekly.start, "M月D日"),
        parseTime(weekly.end, "M月D日"),
      ].join("～")
    }),
    datasets: [
      {
        type: "bar",
        label: "完成题目数量",
        data: props.weeklyData.map((weekly) => weekly.problem_count),
        yAxisID: "y",
      },
      {
        type: "bar",
        label: "总提交次数",
        data: props.weeklyData.map((weekly) => weekly.submission_count),
        yAxisID: "y",
      },
      {
        type: "line",
        label: "等级",
        data: props.weeklyData.map((weekly) =>
          gradeOrder.indexOf(weekly.grade || "C"),
        ),
        tension: 0.4,
        yAxisID: "y1",
        barThickness: 10,
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
      y: {
        ticks: {
          stepSize: 1,
        },
      },
      y1: {
        type: "linear",
        position: "right",
        min: -1,
        max: gradeOrder.length,
        ticks: {
          stepSize: 1,
          callback: (v) => {
            const idx = Number(v)
            return gradeOrder[idx] || ""
          },
        },
      },
    },
    plugins: {
      title: {
        text: title.value,
        display: true,
        font: {
          size: 20,
        },
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

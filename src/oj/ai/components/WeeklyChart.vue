<template>
  <n-spin :show="weeklyLoading">
    <div class="chart">
      <Chart type="bar" :data="data" :options="options" />
    </div>
  </n-spin>
</template>
<script setup lang="ts">
import type { ChartData, ChartOptions, TooltipItem } from "chart.js"
import { Chart } from "vue-chartjs"
import { parseTime } from "~/utils/functions"
import { WeeklyData } from "~/utils/types"
import { getAIWeeklyData } from "~/oj/api"

const props = defineProps<{
  duration: string
  end: string
  username: string
}>()

const weeklyLoading = ref(false)

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
    labels: weeklyData.value.map((weekly) => {
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
        data: weeklyData.value.map((weekly) => weekly.problem_count),
        yAxisID: "y",
      },
      {
        type: "bar",
        label: "总提交次数",
        data: weeklyData.value.map((weekly) => weekly.submission_count),
        yAxisID: "y",
      },
      {
        type: "line",
        label: "等级",
        data: weeklyData.value.map((weekly) =>
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

const weeklyData = ref<WeeklyData[]>([])

async function getWeeklyData() {
  weeklyLoading.value = true
  const res = await getAIWeeklyData(props.end, props.duration, props.username)
  weeklyData.value = res.data
  weeklyLoading.value = false
}

watch(() => [props.duration, props.username], getWeeklyData, {
  immediate: true,
})
</script>
<style scoped>
.chart {
  height: 300px;
  width: 100%;
}
</style>

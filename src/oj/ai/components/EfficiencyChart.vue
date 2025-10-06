<template>
  <n-card :title="title" size="small" v-if="show">
    <template #header-extra>
      <n-text depth="3" style="font-size: 12px">
        反映刷题质量提升
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
  Filler,
} from "chart.js"
import { useAIStore } from "oj/store/ai"
import { parseTime } from "utils/functions"

// 注册折线图所需的 Chart.js 组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const aiStore = useAIStore()

const title = computed(() => {
  if (aiStore.duration === "months:2") {
    return "过去两个月的每周提交效率"
  } else if (aiStore.duration === "months:6") {
    return "过去半年的每月提交效率"
  } else if (aiStore.duration === "years:1") {
    return "过去一年的每月提交效率"
  } else {
    return "过去四周的提交效率"
  }
})

// 判断是否有数据
const show = computed(() => {
  return aiStore.durationData.length > 0
})

// 计算提交效率数据
const efficiencyData = computed(() => {
  return aiStore.durationData.map((duration) => {
    const problemCount = duration.problem_count || 0
    const submissionCount = duration.submission_count || 0
    
    // 计算效率：提交次数/完成题目数
    // 值越接近1，说明一次AC率越高
    const efficiency = problemCount > 0 ? submissionCount / problemCount : 0
    
    // 计算一次AC率（百分比）
    const onePassRate = problemCount > 0 ? (problemCount / submissionCount) * 100 : 0
    
    return {
      label: [
        parseTime(duration.start, "M月D日"),
        parseTime(duration.end, "M月D日"),
      ].join("～"),
      efficiency: efficiency,
      onePassRate: onePassRate,
      problemCount: problemCount,
      submissionCount: submissionCount,
    }
  })
})

// 图表数据
const data = computed<ChartData<"line">>(() => {
  const efficiency = efficiencyData.value

  return {
    labels: efficiency.map((e) => e.label),
    datasets: [
      {
        label: "平均提交次数",
        data: efficiency.map((e) => e.efficiency),
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2.5,
        pointBackgroundColor: "rgb(99, 102, 241)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        yAxisID: "y",
      },
      {
        label: "一次AC率",
        data: efficiency.map((e) => e.onePassRate),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 2.5,
        pointBackgroundColor: "rgb(34, 197, 94)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        yAxisID: "y1",
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
        },
      },
      y: {
        type: "linear",
        position: "left",
        title: {
          display: true,
          text: "平均提交次数（次/题）",
          font: {
            size: 13,
          },
        },
        beginAtZero: true,
        ticks: {
          callback: function (value: string | number) {
            return Number(value).toFixed(1)
          },
        },
      },
      y1: {
        type: "linear",
        position: "right",
        min: 0,
        max: 100,
        title: {
          display: true,
          text: "一次AC率（%）",
          font: {
            size: 13,
          },
        },
        ticks: {
          callback: function (value: string | number) {
            return Number(value).toFixed(0) + "%"
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
          label: function (ctx: TooltipItem<"line">) {
            const index = ctx.dataIndex
            const item = efficiencyData.value[index]
            const dsLabel = ctx.dataset.label || ""

            if (ctx.datasetIndex === 0) {
              // 平均提交次数
              return [
                `${dsLabel}: ${item.efficiency.toFixed(2)} 次/题`,
                `完成题目: ${item.problemCount} 题`,
                `总提交: ${item.submissionCount} 次`,
              ]
            } else {
              // 一次AC率
              return [
                `${dsLabel}: ${item.onePassRate.toFixed(1)}%`,
                `提示: 值越高表示刷题质量越好`,
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


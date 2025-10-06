<template>
  <n-card :title="title" size="small" v-if="show">
    <template #header-extra>
      <n-text depth="3" style="font-size: 12px">
        可视化知识点覆盖面
      </n-text>
    </template>
    <div class="chart">
      <Radar :data="data" :options="options" />
    </div>
  </n-card>
</template>
<script setup lang="ts">
import { Radar } from "vue-chartjs"
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js"
import { useAIStore } from "oj/store/ai"

// 注册雷达图所需的 Chart.js 组件
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
)

const aiStore = useAIStore()

const show = computed(() => {
  return Object.keys(aiStore.detailsData.tags).length > 0
})

// 最多显示前10个标签，避免雷达图过于拥挤
const MAX_TAGS = 10

const title = computed(() => {
  const totalTags = Object.keys(aiStore.detailsData.tags).length
  const displayTags = Math.min(totalTags, MAX_TAGS)
  return `标签雷达图（前${displayTags}个）`
})

// 计算归一化的数据（用于雷达图展示）
const normalizedData = computed(() => {
  const tags = aiStore.detailsData.tags

  // 按题目数量降序排序，取前MAX_TAGS个
  const sortedTags = Object.entries(tags)
    .sort(([, a], [, b]) => b - a)
    .slice(0, MAX_TAGS)

  const values = sortedTags.map(([, value]) => value)
  const maxValue = Math.max(...values, 1) // 避免除以0

  // 归一化到0-100的范围
  return sortedTags.map(([label, value]) => ({
    label,
    value,
    normalized: (value / maxValue) * 100,
  }))
})

const data = computed(() => {
  const tagData = normalizedData.value

  return {
    labels: tagData.map((item) => item.label),
    datasets: [
      {
        label: "掌握程度",
        data: tagData.map((item) => item.normalized),
        backgroundColor: "rgba(99, 102, 241, 0.25)",
        borderColor: "rgb(99, 102, 241)",
        borderWidth: 2.5,
        pointBackgroundColor: "rgb(99, 102, 241)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(99, 102, 241)",
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBorderWidth: 2,
      },
    ],
  }
})

const options = computed(() => {
  const tagData = normalizedData.value

  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        min: 0,
        ticks: {
          stepSize: 20,
          backdropColor: "transparent",
          callback: function (value: string | number) {
            return Number(value) + "%"
          },
          font: {
            size: 11,
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
          circular: true,
        },
        angleLines: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        pointLabels: {
          font: {
            size: 13,
            weight: 500 as const,
          },
          padding: 10,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        callbacks: {
          label: function (context: any) {
            const index = context.dataIndex
            const actualValue = tagData[index].value
            const percentage = Math.round(Number(context.parsed.r))
            return `完成 ${actualValue} 道题 (掌握度 ${percentage}%)`
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

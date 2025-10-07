<template>
  <n-card title="解题排名分布" size="small" v-if="show">
    <template #header-extra>
      <n-text depth="3" style="font-size: 12px">了解解题速度和竞争力</n-text>
    </template>
    <div style="height: 300px">
      <Pie :data="data" :options="options" />
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { Pie } from "vue-chartjs"
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from "chart.js"
import { useAIStore } from "oj/store/ai"

ChartJS.register(ArcElement, Title, Tooltip, Legend)

const aiStore = useAIStore()

// 排名区间定义
const RANK_RANGES = [
  { label: "前10%", min: 0, max: 10, color: "#FF6384" },
  { label: "10-30%", min: 10, max: 30, color: "#FFCE56" },
  { label: "30-50%", min: 30, max: 50, color: "#36A2EB" },
  { label: "50-70%", min: 50, max: 70, color: "#4BC0C0" },
  { label: "70%以后", min: 70, max: 100, color: "#9966FF" },
]

// 计算每道题的排名百分位并分类
const rankDistribution = computed(() => {
  const distribution = RANK_RANGES.map((range) => ({
    ...range,
    count: 0,
    problems: [] as string[],
  }))

  aiStore.detailsData.solved.forEach((item) => {
    const rank = item.rank
    const acCount = item.ac_count

    if (rank && acCount && acCount > 0) {
      // 计算百分位：(rank / acCount) * 100
      // 例如：第5名/共100人 = 5%
      const percentile = (rank / acCount) * 100

      // 找到对应的区间
      const rangeIndex = RANK_RANGES.findIndex(
        (r) => percentile >= r.min && percentile < r.max,
      )

      if (rangeIndex !== -1) {
        distribution[rangeIndex].count++
        distribution[rangeIndex].problems.push(
          `${item.problem.display_id}: ${item.problem.title}`,
        )
      }
    }
  })

  return distribution
})

const show = computed(() => {
  return aiStore.detailsData.solved.length > 0
})

const data = computed(() => {
  return {
    labels: RANK_RANGES.map((r) => r.label),
    datasets: [
      {
        label: "题目数量",
        data: rankDistribution.value.map((r) => r.count),
        backgroundColor: RANK_RANGES.map((r) => r.color),
        borderColor: RANK_RANGES.map((r) => r.color),
        borderWidth: 1,
      },
    ],
  }
})

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
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
    title: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const count = context.parsed
          const total = rankDistribution.value.reduce(
            (sum, r) => sum + r.count,
            0,
          )
          const percentage =
            total > 0 ? ((count / total) * 100).toFixed(1) : "0.0"
          const label = context.label || ""
          return `${label}: ${count} 道题 (${percentage}%)`
        },
        afterLabel: (context: any) => {
          const index = context.dataIndex
          const problems = rankDistribution.value[index].problems
          if (problems.length > 0 && problems.length <= 5) {
            return problems
          } else if (problems.length > 5) {
            return [
              ...problems.slice(0, 3),
              `... 还有 ${problems.length - 3} 道题`,
            ]
          }
          return ""
        },
      },
    },
  },
}
</script>

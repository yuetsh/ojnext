<template>
  <n-card title="难度掌握情况" size="small" v-if="show">
    <template #header-extra>
      <n-text depth="3" style="font-size: 12px">
        了解不同难度题目的完成等级分布
      </n-text>
    </template>
    <div style="height: 300px">
      <Bar :data="data" :options="options" />
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { Bar } from "vue-chartjs"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { useAIStore } from "oj/store/ai"
import type { Grade } from "utils/types"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const aiStore = useAIStore()

// 难度和等级的顺序（后端返回的是中文）
const difficultyOrder = ["简单", "中等", "困难"]
const gradeOrder: Grade[] = ["S", "A", "B", "C"]

// 统计每个难度-等级组合的题目数量
const matrix = computed(() => {
  const result: { [difficulty: string]: { [grade: string]: number } } = {}

  // 初始化矩阵
  difficultyOrder.forEach((diff) => {
    result[diff] = {}
    gradeOrder.forEach((grade) => {
      result[diff][grade] = 0
    })
  })

  // 统计数据
  aiStore.detailsData.solved.forEach((item) => {
    const diff = item.difficulty
    const grade = item.grade
    if (diff && grade && result[diff]) {
      result[diff][grade]++
    }
  })

  return result
})

const show = computed(() => {
  return aiStore.detailsData.solved.length > 0
})

// 为每个等级准备数据集
const data = computed(() => {
  // 为每个等级生成一个 dataset
  const datasets = gradeOrder.map((grade) => {
    return {
      label: `等级 ${grade}`,
      data: difficultyOrder.map((diff) => matrix.value[diff][grade]),
      backgroundColor: getGradeColor(grade),
      borderColor: getGradeColor(grade),
      borderWidth: 1,
    }
  })

  return {
    labels: difficultyOrder,
    datasets,
  }
})

// 根据等级返回对应的颜色
function getGradeColor(grade: Grade): string {
  const colors: { [key in Grade]: string } = {
    S: "#FF6384",
    A: "#FFCE56",
    B: "#36A2EB",
    C: "#95F204",
  }
  return colors[grade]
}

const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: "index" as const,
  },
  scales: {
    x: {
      stacked: true,
      grid: {
        display: false,
      },
    },
    y: {
      stacked: true,
      ticks: {
        stepSize: 1,
      },
      title: {
        display: true,
        text: "题目数量",
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
        footer: (items: any[]) => {
          const total = items.reduce((sum, item) => sum + item.parsed.y, 0)
          return `该难度总计: ${total} 题`
        },
      },
    },
  },
}
</script>


<template>
  <div class="chart" v-if="show">
    <Pie :data="data" :options="options" />
  </div>
</template>
<script setup lang="ts">
import { Pie } from "vue-chartjs"
const props = defineProps<{
  tags: { [key: string]: number }
}>()

const show = computed(() => {
  return Object.keys(props.tags).length > 0
})

const data = computed(() => {
  return {
    labels: Object.keys(props.tags),
    datasets: [
      {
        data: Object.values(props.tags),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
      },
    ],
  }
})

const options = computed(() => {
  return {
    interaction: {
      intersect: false,
    },
    maintainAspectRatio: false,
    plugins: {
      title: {
        text: `题目的标签分布（前${Object.keys(props.tags).length}个）`,
        display: true,
        font: {
          size: 20,
        },
      },
    },
  }
})
</script>
<style scoped>
.chart {
  height: 100%;
  width: 100%;
}
</style>

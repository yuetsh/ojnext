<template>
  <div class="chart" v-if="show">
    <Bar :data="data" :options="options" />
  </div>
</template>
<script setup lang="ts">
import { Bar } from "vue-chartjs"

const props = defineProps<{
  difficulty: { [key: string]: number }
}>()

const show = computed(() => {
  return Object.values(props.difficulty).reduce((a, b) => a + b, 0) > 0
})

const data = computed(() => {
  return {
    labels: Object.keys(props.difficulty),
    datasets: [
      {
        data: Object.values(props.difficulty),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  }
})

const options = {
  interaction: {
    intersect: false,
  },
  maintainAspectRatio: false,
  y: {
    ticks: {
      stepSize: 1,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    title: {
      text: "题目的难度统计",
      display: true,
      font: {
        size: 20,
      },
    },
  },
}
</script>
<style scoped>
.chart {
  height: 300px;
  width: 300px;
}
</style>

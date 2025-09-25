<template>
  <div class="chart">
    <n-h1 class="title">过去一年的提交次数热力图</n-h1>
    <n-heatmap
      :loading="!data.length"
      :color-theme="getRandomColorTheme()"
      size="large"
      :data="data"
      :tooltip="{ placement: 'top' }"
    >
      <template #tooltip="{ timestamp, value }">
        <div>{{ new Date(timestamp).toLocaleDateString() }}</div>
        <div>提交次数: {{ value }}</div>
      </template>
    </n-heatmap>
  </div>
</template>
<script setup lang="ts">
import { type HeatmapData } from "naive-ui"
import { getAIHeatmapData } from "~/oj/api"

const data = ref<HeatmapData>([])

function getRandomColorTheme() {
  const themes = ["green", "blue", "orange", "purple", "red"] as const
  return themes[Math.floor(Math.random() * themes.length)]
}

onMounted(async () => {
  const res = await getAIHeatmapData()
  data.value = res.data
})
</script>
<style scoped>
.chart {
  margin: 0 auto;
}
.title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
}
</style>

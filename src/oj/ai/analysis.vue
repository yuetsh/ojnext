<template>
  <n-spin :show="aiStore.loading.fetching" :delay="50">
    <n-grid :cols="isDesktop ? 2 : 1" :x-gap="20" :y-gap="20">
      <n-gi :span="1">
        <n-flex vertical size="large">
          <n-flex align="center" justify="space-between">
            <n-h3 style="margin: 0">请选择时间范围，智能分析学习情况</n-h3>
            <n-select
              style="width: 140px"
              :options="options"
              v-model:value="aiStore.duration"
            />
          </n-flex>
          <Overview />
          <n-grid :cols="2" :x-gap="20" :y-gap="20">
            <n-gi :span="isDesktop ? 1 : 2">
              <DifficultyGradeChart />
            </n-gi>
            <n-gi :span="isDesktop ? 1 : 2">
              <TagsRadarChart />
            </n-gi>
            <n-gi :span="isDesktop ? 1 : 2">
              <RankDistributionChart />
            </n-gi>
            <n-gi :span="isDesktop ? 1 : 2">
              <TimeActivityHeatmap />
            </n-gi>
          </n-grid>
          <SolvedTable />
        </n-flex>
      </n-gi>
      <n-gi :span="1">
        <n-flex vertical size="large">
          <Heatmap />
          <ProgressChart />
          <EfficiencyChart />
          <DurationChart />
          <AI v-if="aiStore.detailsData.solved.length >= 10" />
        </n-flex>
      </n-gi>
      <n-gi :span="2">
        <AI
          v-if="
            aiStore.detailsData.solved.length > 0 &&
            aiStore.detailsData.solved.length < 10
          "
        />
      </n-gi>
    </n-grid>
  </n-spin>
</template>
<script setup lang="ts">
import { useBreakpoints } from "shared/composables/breakpoints"
import { formatISO, sub, type Duration } from "date-fns"
import TagsRadarChart from "./components/TagsRadarChart.vue"
import DifficultyGradeChart from "./components/DifficultyGradeChart.vue"
import TimeActivityHeatmap from "./components/TimeActivityHeatmap.vue"
import RankDistributionChart from "./components/RankDistributionChart.vue"
import Overview from "./components/Overview.vue"
import Heatmap from "./components/Heatmap.vue"
import ProgressChart from "./components/ProgressChart.vue"
import DurationChart from "./components/DurationChart.vue"
import EfficiencyChart from "./components/EfficiencyChart.vue"
import AI from "./components/AI.vue"
import SolvedTable from "./components/SolvedTable.vue"
import { useAIStore } from "../store/ai"
import { DURATION_OPTIONS } from "utils/constants"

const aiStore = useAIStore()

const { isDesktop } = useBreakpoints()

const options = [...DURATION_OPTIONS]

const subOptions = computed<Duration>(() => {
  let dur = options.find((it) => it.value === aiStore.duration) ?? options[0]
  const x = dur.value!.toString().split(":")
  const unit = x[0]
  const n = x[1]
  return { [unit]: parseInt(n) } as Duration
})

const start = computed(() => {
  const current = new Date()
  return formatISO(sub(current, subOptions.value))
})

const end = computed(() => {
  return formatISO(new Date())
})

// 获取热力图数据（仅一次）
onMounted(() => {
  aiStore.fetchHeatmapData()
})

watch(
  () => aiStore.duration,
  () => {
    aiStore.fetchAnalysisData(start.value, end.value, aiStore.duration)
  },
  { immediate: true },
)
</script>

<template>
  <n-spin :show="aiStore.loading.fetching">
    <n-grid :cols="isDesktop ? 5 : 1" :x-gap="20" :y-gap="20">
      <n-gi :span="2">
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
          <n-grid :cols="2" :x-gap="20">
            <n-gi :span="1">
              <TagsChart />
            </n-gi>
            <n-gi :span="1">
              <n-flex vertical :size="20">
                <DifficultyChart />
                <GradeChart />
              </n-flex>
            </n-gi>
          </n-grid>
          <SolvedTable />
        </n-flex>
      </n-gi>
      <n-gi :span="3">
        <n-flex vertical size="large">
          <Heatmap />
          <ProgressChart />
          <DurationChart />
          <AI v-if="aiStore.detailsData.solved.length >= 10" />
        </n-flex>
      </n-gi>
      <n-gi :span="5">
        <AI v-if="aiStore.detailsData.solved.length > 0 && aiStore.detailsData.solved.length < 10" />
      </n-gi>
    </n-grid>
  </n-spin>
</template>
<script setup lang="ts">
import { isDesktop } from "shared/composables/breakpoints"
import { formatISO, sub, type Duration } from "date-fns"
import TagsChart from "./components/TagsChart.vue"
import DifficultyChart from "./components/DifficultyChart.vue"
import GradeChart from "./components/GradeChart.vue"
import Overview from "./components/Overview.vue"
import Heatmap from "./components/Heatmap.vue"
import ProgressChart from "./components/ProgressChart.vue"
import DurationChart from "./components/DurationChart.vue"
import AI from "./components/AI.vue"
import SolvedTable from "./components/SolvedTable.vue"
import { useAIStore } from "../store/ai"

const aiStore = useAIStore()

const options: SelectOption[] = [
  { label: "一节课内", value: "hours:1" },
  { label: "两节课内", value: "hours:2" },
  { label: "一天内", value: "days:1" },
  { label: "一周内", value: "weeks:1" },
  { label: "一个月内", value: "months:1" },
  { label: "两个月内", value: "months:2" },
  { label: "半年内", value: "months:6" },
  { label: "一年内", value: "years:1" },
]

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

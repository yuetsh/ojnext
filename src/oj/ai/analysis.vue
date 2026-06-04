<template>
  <n-spin :show="aiStore.loading.fetching" :delay="50">
    <n-grid :cols="isDesktop ? 2 : 1" :x-gap="20" :y-gap="20">
      <n-gi :span="1">
        <n-flex vertical size="large">
          <n-flex align="center" justify="space-between">
            <n-h3 style="margin: 0">请选择时间范围，智能分析学习情况</n-h3>
            <n-flex align="center">
              <n-input
                v-if="userStore.isSuperAdmin"
                v-model:value="urlUsername"
                placeholder="查看指定用户"
                clearable
                style="width: 140px"
                @change="onUsernameChange"
                @clear="onUsernameChange"
              />
              <n-select
                style="width: 140px"
                :options="options"
                v-model:value="urlDuration"
              />
            </n-flex>
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
          <AI v-if="aiStore.detailsData.solved.length > 10" />
        </n-flex>
      </n-gi>
      <n-gi :span="2">
        <AI
          v-if="
            aiStore.detailsData.solved.length > 0 &&
            aiStore.detailsData.solved.length <= 10
          "
        />
      </n-gi>
    </n-grid>
  </n-spin>
</template>
<script setup lang="ts">
import { useBreakpoints } from "shared/composables/breakpoints"
import { formatISO, sub, type Duration } from "date-fns"
import { useRouteQuery } from "@vueuse/router"
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
import { useUserStore } from "shared/store/user"
import { DURATION_OPTIONS } from "utils/constants"

const aiStore = useAIStore()
const userStore = useUserStore()
const { isDesktop } = useBreakpoints()

const options = [...DURATION_OPTIONS]

const urlUsername = useRouteQuery<string>("username", "")
const urlDuration = useRouteQuery<string>("duration", "months:6")

// Initialize store synchronously from URL params before watch fires
aiStore.targetUsername = urlUsername.value
aiStore.duration = urlDuration.value

const subOptions = computed<Duration>(() => {
  let dur = options.find((it) => it.value === aiStore.duration) ?? options[0]
  const x = dur.value!.toString().split(":")
  return { [x[0]]: parseInt(x[1]) } as Duration
})

const start = computed(() => formatISO(sub(new Date(), subOptions.value)))
const end = computed(() => formatISO(new Date()))

function onUsernameChange() {
  aiStore.targetUsername = urlUsername.value
  aiStore.fetchHeatmapData()
  aiStore.fetchAnalysisData(start.value, end.value, aiStore.duration)
}

onMounted(() => {
  aiStore.fetchHeatmapData()
  if (!aiStore.targetUsername) {
    aiStore.fetchPinnedReport()
  }
})

watch(
  () => urlDuration.value,
  (val) => {
    aiStore.duration = val
    aiStore.fetchAnalysisData(start.value, end.value, val)
  },
  { immediate: true },
)
</script>

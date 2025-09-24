<template>
  <n-grid :cols="isDesktop ? 5: 1" :x-gap="20">
    <n-gi :span="2">
      <n-flex vertical size="large">
        <n-flex align="center" justify="space-between">
          <n-h3 style="margin: 0;">请选择时间范围，智能分析学习情况</n-h3>
          <n-select
            style="width: 140px"
            :options="options"
            v-model:value="aiStore.duration"
          />
        </n-flex>
        <Details :start="start" :end="end" />
      </n-flex>
    </n-gi>
    <n-gi :span="3">
      <n-flex vertical size="large">
        <WeeklyChart :end="end" />
        <AI v-if="aiStore.detailsData.solved.length" />
      </n-flex>
    </n-gi>
  </n-grid>
</template>
<script setup lang="ts">
import { isDesktop } from "~/shared/composables/breakpoints"
import { formatISO, sub, type Duration } from "date-fns"
import WeeklyChart from "./components/WeeklyChart.vue"
import Details from "./components/Details.vue"
import AI from "./components/AI.vue"
import { useAIStore } from "../store/ai"

const aiStore = useAIStore()

const start = ref("")
const end = ref("")

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

function updateRange() {
  const current = new Date()
  end.value = formatISO(current)
  start.value = formatISO(sub(current, subOptions.value))
}

watch(() => aiStore.duration, updateRange, { immediate: true })
</script>

<template>
  <n-space size="large" vertical>
    <n-form :show-feedback="false" inline label-placement="left">
      <n-form-item>
        <n-input
          placeholder="用户（可选）"
          v-model:value="query.username"
          clearable
        />
      </n-form-item>
      <n-form-item>
        <n-input
          placeholder="题号（可选）"
          v-model:value="query.problem"
          clearable
        />
      </n-form-item>
      <n-form-item>
        <n-select
          style="width: 120px"
          v-model:value="query.duration"
          :options="options"
        />
      </n-form-item>
      <n-form-item>
        <n-select
          style="width: 120px"
          v-model:value="query.groupby"
          :options="groupbys"
        />
      </n-form-item>
      <n-form-item>
        <n-button type="primary" @click="handleStatistics">统计</n-button>
      </n-form-item>
    </n-form>
    <n-space v-if="count.total > 0" size="large">
      <n-h1>
        <n-gradient-text type="primary">
          答案正确数：{{ count.accepted }}
        </n-gradient-text>
      </n-h1>
      <n-h1>
        <n-gradient-text type="info">
          总提交数：{{ count.total }}
        </n-gradient-text>
      </n-h1>
      <n-h1>
        <n-gradient-text type="warning">
          正确率：{{ count.rate }}
        </n-gradient-text>
      </n-h1>
    </n-space>
    <n-space v-else>
      <n-h1>
        <n-gradient-text type="primary">暂无提交</n-gradient-text>
      </n-h1>
    </n-space>
  </n-space>
</template>
<script setup lang="ts">
import { formatISO, sub, type Duration } from "date-fns"
import { getSubmissionStatistics } from "oj/api"

interface Props {
  problem: string
  username: string
}

const props = defineProps<Props>()

const options: SelectOption[] = [
  { label: "本节课内", value: "hours:1" },
  { label: "两小时内", value: "hours:2" },
  { label: "一天内", value: "days:1" },
  { label: "一周内", value: "weeks:1" },
  { label: "一个月内", value: "months:1" },
  { label: "一年内", value: "years:1" },
]

const groupbys: SelectOption[] = [
  { label: "用户分组", value: "problem" },
  { label: "题目分组", value: "username" },
]

const query = reactive({
  username: props.username,
  problem: props.problem,
  duration: options[options.length - 1].value,
  groupby: groupbys[0].value,
})

const count = reactive({
  total: 0,
  accepted: 0,
  rate: 0,
})

const subOptions = computed<Duration>(() => {
  let dur = options.find((it) => it.value === query.duration) ?? options[0]
  const x = dur.value!.toString().split(":")
  const unit = x[0]
  const n = x[1]
  return { [unit]: parseInt(n) }
})

async function handleStatistics() {
  const current = Date.now()
  const end = formatISO(current)
  const start = formatISO(sub(current, subOptions.value))
  const res = await getSubmissionStatistics(
    { start, end },
    query.problem,
    query.username,
  )
  count.total = res.data.submission_count
  count.accepted = res.data.accepted_count
  count.rate = res.data.correct_rate
}
</script>

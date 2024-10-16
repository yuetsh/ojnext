<template>
  <n-flex size="large" vertical>
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
        <n-button type="primary" @click="handleStatistics">统计</n-button>
      </n-form-item>
    </n-form>
    <n-space v-if="count.total > 0" size="large">
      <n-h1 style="margin-bottom: 0">
        <n-gradient-text type="primary">
          正确提交数：{{ count.accepted }}
        </n-gradient-text>
      </n-h1>
      <n-h1 style="margin-bottom: 0">
        <n-gradient-text type="info">
          总提交数：{{ count.total }}
        </n-gradient-text>
      </n-h1>
      <n-h1 style="margin-bottom: 0">
        <n-gradient-text type="warning">
          正确率：{{ count.rate }}
        </n-gradient-text>
      </n-h1>
    </n-space>
    <n-space v-if="count.total > 0" size="large">
      <n-h1>
        <n-gradient-text type="error">
          回答正确的人数：{{ list.length }}
        </n-gradient-text>
      </n-h1>
      <n-h1 v-if="person.count > 0">
        <n-gradient-text type="warning">
          班级人数：{{ person.count }}
        </n-gradient-text>
      </n-h1>
      <n-h1 v-if="person.count > 0">
        <n-gradient-text type="success">
          班级完成度：{{ person.rate }}
        </n-gradient-text>
      </n-h1>
      <n-flex v-if="listUnaccepted.length > 0" style="margin-top: 8px">
        <n-button type="warning" @click="toggleUnaccepted(!unaccepted)">
          {{ unaccepted ? "隐藏没有完成的" : "显示没有完成的" }}
        </n-button>
        <n-button @click="copyUnaccepted">复制名单</n-button>
      </n-flex>
    </n-space>
    <n-h1 v-if="count.total === 0">
      <n-gradient-text type="primary">暂无数据统计</n-gradient-text>
    </n-h1>
    <n-space v-if="unaccepted" size="large">
      <n-h1>这{{ listUnaccepted.length }}位没有完成：</n-h1>
      <n-h1 v-for="item in listUnaccepted" :key="item">
        {{ removeClassname(item) }}
      </n-h1>
    </n-space>
    <n-data-table v-if="list.length" striped :columns="columns" :data="list" />
  </n-flex>
</template>
<script setup lang="ts">
import { formatISO, sub, type Duration } from "date-fns"
import { getSubmissionStatistics } from "oj/api"

interface Props {
  problem: string
  username: string
}

const props = defineProps<Props>()

const message = useMessage()
const options: SelectOption[] = [
  { label: "30分钟内", value: "minutes:30" },
  { label: "本节课内", value: "hours:1" },
  { label: "两小时内", value: "hours:2" },
  { label: "一天内", value: "days:1" },
  { label: "一周内", value: "weeks:1" },
  { label: "一个月内", value: "months:1" },
]

const columns: DataTableColumn[] = [
  { title: "用户", key: "username" },
  { title: "提交数", key: "submission_count" },
  { title: "已解决", key: "accepted_count" },
  { title: "正确率", key: "correct_rate" },
]

const query = reactive({
  username: props.username,
  problem: props.problem,
  duration: options[0].value,
})

const count = reactive({
  total: 0,
  accepted: 0,
  rate: 0,
})
const person = reactive({
  count: 0,
  rate: 0,
})
const list = ref([])
const listUnaccepted = ref([])
const [unaccepted, toggleUnaccepted] = useToggle()

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
  list.value = res.data.data
  listUnaccepted.value = res.data.data_unaccepted
  person.count = res.data.person_count
  person.rate = res.data.person_rate

  toggleUnaccepted(false)
}

function removeClassname(name: string) {
  if (name.startsWith("ks")) {
    return name.slice(5)
  }
  return name
}

function copyUnaccepted() {
  const grade = query.username.slice(2, 4)
  const classname = query.username.slice(4, 5)
  const prefix = `${grade}计算机${classname}班${query.problem}这道题有${listUnaccepted.value.length}人没有完成，分别是：`
  const names = listUnaccepted.value.map(removeClassname).join("、")
  const suffix = "。请以上同学尽快完成！"
  console.log(prefix+names+suffix)
  message.success("到 DevTool 中手动复制")
}
</script>

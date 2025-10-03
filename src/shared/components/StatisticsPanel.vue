<template>
  <n-flex>
    <n-input
      placeholder="用户（可选）"
      v-model:value="query.username"
      style="width: 160px"
      clearable
    />
    <n-input
      placeholder="题号（可选）"
      v-model:value="query.problem"
      style="width: 160px"
      clearable
    />
    <n-select
      style="width: 120px"
      v-model:value="query.duration"
      :options="options"
    />
    <n-button type="primary" @click="handleStatistics">统计</n-button>
    <n-button v-if="route.name !== 'submissions'" @click="goSubmissions">
      前往提交列表
    </n-button>
  </n-flex>
  <n-flex style="margin: 20px 0" v-if="count.total > 0">
    <n-gradient-text font-size="24" type="primary">
      正确提交数：{{ count.accepted }}
    </n-gradient-text>
    <n-gradient-text font-size="24" type="info">
      总提交数：{{ count.total }}
    </n-gradient-text>
    <n-gradient-text font-size="24" type="warning">
      正确率：{{ count.rate }}
    </n-gradient-text>
  </n-flex>
  <n-flex style="margin: 20px 0" v-if="count.total > 0">
    <n-gradient-text font-size="24" type="error">
      回答正确的人数：{{ list.length }}
    </n-gradient-text>
    <n-gradient-text font-size="24" v-if="person.count > 0" type="warning">
      班级人数：{{ person.count }}
    </n-gradient-text>
    <n-gradient-text font-size="24" v-if="person.count > 0" type="success">
      班级完成度：{{ person.rate }}
    </n-gradient-text>
    <n-flex v-if="listUnaccepted.length > 0">
      <n-button type="warning" @click="toggleUnaccepted(!unaccepted)">
        {{ unaccepted ? "隐藏没有完成的" : "显示没有完成的" }}
      </n-button>
    </n-flex>
  </n-flex>
  <n-gradient-text
    font-size="24"
    style="margin-top: 20px"
    v-if="count.total === 0"
    type="primary"
  >
    暂无数据统计
  </n-gradient-text>
  <n-flex style="margin-bottom: 20px" v-if="unaccepted" size="large">
    <span style="font-size: 24px">
      这 {{ listUnaccepted.length }} 位没有完成：
    </span>
    <span style="font-size: 24px" v-for="name in listUnaccepted" :key="name">
      {{ name }}
    </span>
  </n-flex>
  <n-data-table v-if="list.length" striped :columns="columns" :data="list" />
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
  { label: "10分钟内", value: "minutes:10" },
  { label: "20分钟内", value: "minutes:20" },
  { label: "30分钟内", value: "minutes:30" },
  { label: "本节课内", value: "hours:1" },
  { label: "两小时内", value: "hours:2" },
  { label: "一天内", value: "days:1" },
  { label: "一周内", value: "weeks:1" },
  { label: "一个月内", value: "months:1" },
  { label: "一年内", value: "years:1" },
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
const route = useRoute()
const router = useRouter()

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

function goSubmissions() {
  router.push({
    name: "submissions",
    query: {
      username: query.username,
      problem: query.problem,
    },
  })
}
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
</script>

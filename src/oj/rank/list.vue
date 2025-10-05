<script setup lang="ts">
import { formatISO, sub, type Duration } from "date-fns"
import { NButton } from "naive-ui"
import { getActivityRank, getRank } from "oj/api"
import { getACRate } from "utils/functions"
import { Rank } from "utils/types"
import Pagination from "shared/components/Pagination.vue"
import { ChartType } from "utils/constants"
import { renderTableTitle } from "utils/renders"
import Chart from "./components/Chart.vue"
import Index from "./components/Index.vue"

const router = useRouter()
const data = ref<Rank[]>([])
const total = ref(0)
const query = reactive({
  limit: 10,
  page: 1,
})
const chart = ref<Rank[]>([])
const chartType = ref(ChartType.Rank)
const duration = ref("weeks:1")

async function init() {
  const offset = (query.page - 1) * query.limit
  const res = await getRank(offset, query.limit, 100)
  data.value = res.data.results
  total.value = res.data.total
  return res.data.results
}

const columns: DataTableColumn<Rank>[] = [
  {
    title: renderTableTitle("排名", "streamline-emojis:flexed-biceps-1"),
    key: "index",
    width: 100,
    align: "center",
    render: (_, index) =>
      h(Index, { index, page: query.page, limit: query.limit }),
  },
  {
    title: renderTableTitle(
      "用户",
      "streamline-emojis:smiling-face-with-sunglasses",
    ),
    key: "username",
    width: 200,
    render: (row) =>
      h(
        NButton,
        {
          text: true,
          type: "info",
          onClick: () => router.push("/user?name=" + row.user.username),
        },
        () => row.user.username,
      ),
  },
  {
    title: renderTableTitle(
      "个性签名",
      "streamline-emojis:no-one-under-eighteen",
    ),
    key: "mood",
    minWidth: 200,
  },
  {
    title: renderTableTitle("已解决", "streamline-emojis:raised-fist-1"),
    key: "accepted_number",
    width: 120,
    align: "center",
  },
  {
    title: renderTableTitle("提交数", "streamline-emojis:rocket"),
    key: "submission_number",
    width: 120,
    align: "center",
  },
  {
    title: renderTableTitle("正确率", "streamline-emojis:wrapped-gift-1"),
    key: "rate",
    width: 120,
    align: "center",
    render: (row) => getACRate(row.accepted_number, row.submission_number),
  },
]

watch(() => query.page, init)
watch(
  () => query.limit,
  () => {
    query.page = 1
    init()
  },
)
watch(duration, listActivity)

async function listActivity() {
  chartType.value = ChartType.Activity
  const current = Date.now()
  const start = formatISO(sub(current, subOptions.value))
  const res = await getActivityRank(start)
  chart.value = res.data.map((d: { username: string; count: number }) => ({
    user: {
      username: d.username,
    },
    accepted_number: d.count,
    submission_number: 0,
  }))
}

async function listRank() {
  chartType.value = ChartType.Rank
  const res = await getRank(0, 10, 10)
  data.value = res.data.results
  chart.value = data.value
}

const options: SelectOption[] = [
  { label: "一周内", value: "weeks:1" },
  { label: "一个月内", value: "months:1" },
  { label: "两个月内", value: "months:2" },
  { label: "半年内", value: "months:6" },
  { label: "一年内", value: "years:1" },
]

const subOptions = computed<Duration>(() => {
  let dur = options.find((it) => it.value === duration.value) ?? options[0]
  const x = dur.value!.toString().split(":")
  const unit = x[0]
  const n = x[1]
  return { [unit]: parseInt(n) }
})

onMounted(async () => {
  chart.value = await init()
})
</script>

<template>
  <n-flex justify="center">
    <n-button-group>
      <n-button
        @click="listRank"
        :type="chartType === ChartType.Rank ? 'primary' : 'default'"
      >
        天梯排名
      </n-button>
      <n-button
        @click="listActivity"
        :type="chartType === ChartType.Activity ? 'primary' : 'default'"
      >
        活跃度排名
      </n-button>
    </n-button-group>
    <div v-if="chartType === ChartType.Activity">
      <n-select
        style="width: 120px"
        :options="options"
        v-model:value="duration"
      />
    </div>
  </n-flex>
  <Chart v-if="!!chart.length" :type="chartType" :rank-data="chart" />
  <n-empty v-else style="padding: 20px 0"></n-empty>
  <n-flex justify="center">
    <n-h2>全校前100名</n-h2>
  </n-flex>
  <n-data-table :data="data" :columns="columns" />
  <Pagination
    :total="total"
    v-model:page="query.page"
    v-model:limit="query.limit"
  />
</template>

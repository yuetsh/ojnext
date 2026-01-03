<script setup lang="ts">
import { getClassRank } from "oj/api"
import Pagination from "shared/components/Pagination.vue"
import { renderTableTitle } from "utils/renders"

interface ClassRank {
  rank: number
  class_name: string
  user_count: number
  total_ac: number
  total_submission: number
  avg_ac: number
  ac_rate: number
}

const data = ref<ClassRank[]>([])
const total = ref(0)
const query = reactive({
  limit: 20,
  page: 1,
  grade: null as number | null,
})

const gradeOptions = [
  { label: "24年级", value: 24 },
  { label: "23年级", value: 23 },
  { label: "22年级", value: 22 },
  { label: "21年级", value: 21 },
  { label: "20年级", value: 20 },
]

const columns: DataTableColumn<ClassRank>[] = [
  {
    title: renderTableTitle("排名", "streamline-emojis:flexed-biceps-1"),
    key: "rank",
    width: 100,
    render: (row) => {
      if (row.rank === 1) return "🥇"
      if (row.rank === 2) return "🥈"
      if (row.rank === 3) return "🥉"
      return row.rank
    },
  },
  {
    title: renderTableTitle("班级", "streamline-emojis:trophy"),
    key: "class_name",
    width: 200,
  },
  {
    title: renderTableTitle("人数", "streamline-emojis:people"),
    key: "user_count",
    width: 100,
  },
  {
    title: renderTableTitle("总AC数", "streamline-emojis:raised-fist-1"),
    key: "total_ac",
    width: 120,
  },
  {
    title: renderTableTitle("总提交数", "streamline-emojis:rocket"),
    key: "total_submission",
    width: 120,
  },
  {
    title: renderTableTitle("平均AC数", "streamline-emojis:chart"),
    key: "avg_ac",
    width: 120,
  },
  {
    title: renderTableTitle("正确率", "streamline-emojis:wrapped-gift-1"),
    key: "ac_rate",
    width: 100,
    render: (row) => `${row.ac_rate}%`,
  },
]

async function init() {
  if (query.grade === null) {
    data.value = []
    total.value = 0
    return
  }
  const offset = (query.page - 1) * query.limit
  const res = await getClassRank(offset, query.limit, query.grade)
  data.value = res.data.results
  total.value = res.data.total
}

watch(() => query.page, init)
watch(
  () => query.limit,
  () => {
    query.page = 1
    init()
  },
)
watch(
  () => query.grade,
  () => {
    query.page = 1
    init()
  },
)

onMounted(() => {
  if (query.grade !== null) {
    init()
  }
})
</script>

<template>
  <n-flex justify="center">
    <n-h2>班级排名</n-h2>
  </n-flex>
  <n-flex justify="space-between" style="margin-bottom: 16px">
    <n-select
      v-model:value="query.grade"
      placeholder="选择年级"
      clearable
      style="width: 200px"
      :options="gradeOptions"
    />
  </n-flex>
  <n-data-table :data="data" :columns="columns" />
  <Pagination
    :total="total"
    v-model:page="query.page"
    v-model:limit="query.limit"
  />
</template>

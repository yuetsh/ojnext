<script setup lang="ts">
import { DataTableColumn, NButton } from "naive-ui"
import Chart from "./components/Chart.vue"
import Pagination from "~/shared/Pagination.vue"
import { Rank } from "utils/types"
import { getRank } from "oj/api"
import { getACRate } from "utils/functions"

const router = useRouter()
const data = ref<Rank[]>([])
const total = ref(0)
const query = reactive({
  limit: 10,
  page: 1,
})
const chart = ref<Rank[]>([])

async function listRanks() {
  const offset = (query.page - 1) * query.limit
  const res = await getRank(offset, query.limit)
  data.value = res.data.results
  total.value = res.data.total
  if (query.page === 1) {
    chart.value = data.value
  }
}

const columns: DataTableColumn<Rank>[] = [
  {
    title: "排名",
    key: "index",
    width: 100,
    render: (_, index) =>
      h("span", {}, index + (query.page - 1) * query.limit + 1),
  },
  {
    title: "用户",
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
        () => row.user.username
      ),
  },
  { title: "骚话", key: "mood", minWidth: 200 },
  { title: "已解决", key: "accepted_number", width: 100 },
  { title: "提交数", key: "submission_number", width: 100 },
  {
    title: "正确率",
    key: "rate",
    width: 100,
    render: (row) => getACRate(row.accepted_number, row.submission_number),
  },
]

watch(() => query.page, listRanks)
watch(
  () => query.limit,
  () => {
    query.page = 1
    listRanks()
  }
)

onMounted(listRanks)
</script>

<template>
  <Chart v-if="!!chart.length" :rankData="chart" />
  <n-data-table striped :data="data" :columns="columns" />
  <Pagination
    :total="total"
    v-model:page="query.page"
    v-model:limit="query.limit"
  />
</template>

<style scoped></style>

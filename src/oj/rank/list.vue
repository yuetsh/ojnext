<script setup lang="ts">
import { NButton } from "naive-ui"
import Chart from "./components/Chart.vue"
import Pagination from "~/shared/components/Pagination.vue"
import { Rank } from "utils/types"
import { getRank } from "oj/api"
import { getACRate } from "utils/functions"
import Index from "./components/Index.vue"
import { renderTableTitle } from "~/utils/renders"

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
  const res = await getRank(offset, query.limit, 100)
  data.value = res.data.results
  total.value = res.data.total
  if (query.page === 1) {
    chart.value = data.value
  }
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

watch(() => query.page, listRanks)
watch(
  () => query.limit,
  () => {
    query.page = 1
    listRanks()
  },
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

<script setup lang="ts">
import { DataTableColumn, NSwitch, NTag } from "naive-ui"
import Pagination from "~/shared/Pagination.vue"
import { Contest } from "~/utils/types"
import { getContestList } from "../api"
import ContestType from "~/shared/ContestType.vue"
import ContestTitle from "~/shared/ContestTitle.vue"
import { CONTEST_STATUS } from "~/utils/constants"
import Actions from "./components/Actions.vue"

const contests = ref<Contest[]>([])
const total = ref(0)
const query = reactive({
  limit: 10,
  page: 1,
  keyword: "",
})

function toggleVisible(id: number) {}

const columns: DataTableColumn<Contest>[] = [
  { title: "ID", key: "id", width: 60 },
  {
    title: "比赛",
    key: "title",
    minWidth: 250,
    render: (row) => h(ContestTitle, { contest: row }),
  },
  {
    title: "类型",
    key: "contest_type",
    width: 80,
    render: (row) => h(ContestType, { contest: row, size: "small" }),
  },
  {
    title: "状态",
    key: "status",
    width: 80,
    render: (row) =>
      h(
        NTag,
        { type: CONTEST_STATUS[row.status]["type"], size: "small" },
        () => CONTEST_STATUS[row.status]["name"]
      ),
  },
  {
    title: "可见",
    key: "visible",
    width: 60,
    render: (row) =>
      h(NSwitch, {
        value: row.visible,
        size: "small",
        rubberBand: false,
        onUpdateValue: () => toggleVisible(row.id),
      }),
  },
  {
    title: "选项",
    key: "actions",
    width: 260,
    render: (row) => h(Actions, { contest: row }),
  },
]

async function listContests() {
  const offset = (query.page - 1) * query.limit
  const res = await getContestList(offset, query.limit, query.keyword)
  contests.value = res.data.results
  total.value = res.data.total
}
onMounted(listContests)
watch(query, listContests, { deep: true })
</script>

<template>
  <n-form inline label-placement="left">
    <n-form-item>
      <n-input v-model:value="query.keyword" placeholder="输入标题关键字" />
    </n-form-item>
  </n-form>
  <n-data-table :columns="columns" :data="contests" size="small" />
  <Pagination
    :total="total"
    v-model:limit="query.limit"
    v-model:page="query.page"
  />
</template>

<style scoped></style>

<script setup lang="ts">
import { getProblemList } from "../api"
import Pagination from "~/shared/Pagination.vue"
import { DataTableColumn, NButton, NSwitch } from "naive-ui"
import { AdminProblemFiltered } from "~/utils/types"
import { parseTime } from "~/utils/functions"

const total = ref(0)
const problems = ref([])
const query = reactive({
  limit: 10,
  page: 1,
  keyword: "",
})

const columns: DataTableColumn<AdminProblemFiltered>[] = [
  { title: "ID", key: "id", width: 100 },
  { title: "显示编号", key: "_id", width: 100 },
  { title: "标题", key: "title", minWidth: 300 },
  { title: "出题人", key: "username", width: 100 },
  {
    title: "创建时间",
    key: "create_time",
    width: 200,
    render: (row) => parseTime(row.create_time, "YYYY-MM-DD hh:mm:ss"),
  },
  {
    title: "可见",
    key: "visible",
    render: (row) => h(NSwitch, { value: row.visible }),
  },
  {
    key: "edit",
    render: () =>
      h(
        NButton,
        { type: "primary", size: "small", tertiary: true },
        { default: () => "编辑" }
      ),
  },
  {
    key: "delete",
    render: () =>
      h(
        NButton,
        { type: "error", size: "small", tertiary: true },
        { default: () => "删除" }
      ),
  },
  {
    key: "download",
    render: () =>
      h(NButton, { size: "small", tertiary: true }, { default: () => "下载" }),
  },
]

async function listProblems() {
  const offset = (query.page - 1) * query.limit
  const res = await getProblemList(offset, query.limit, {
    keyword: query.keyword,
  })
  total.value = res.total
  problems.value = res.results
}

onMounted(listProblems)

watch(query, listProblems, { deep: true })
</script>

<template>
  <n-form inline label-placement="left">
    <n-form-item label="标题">
      <n-input v-model:value="query.keyword" />
    </n-form-item>
  </n-form>
  <n-data-table striped size="small" :columns="columns" :data="problems" />
  <Pagination
    :total="total"
    v-model:limit="query.limit"
    v-model:page="query.page"
  />
</template>

<style scoped></style>

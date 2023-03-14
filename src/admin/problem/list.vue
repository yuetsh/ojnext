<script setup lang="ts">
import { getProblemList } from "../api"
import Pagination from "~/shared/Pagination.vue"
import { DataTableColumn } from "naive-ui"
import { ProblemFiltered } from "~/utils/types"

const total = ref(0)
const problems = ref([])
const query = reactive({
  limit: 10,
  page: 1,
  keyword: "",
})

const columns: DataTableColumn<ProblemFiltered>[] = [
  { title: "编号", key: "_id", width: 100 },
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
</script>

<template>
  <n-data-table :columns="columns" :data="problems" />
  <Pagination
    :total="total"
    v-model:limit="query.limit"
    v-model:page="query.page"
  />
</template>

<style scoped></style>

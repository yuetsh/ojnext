<script setup lang="ts">
import { DataTableColumn, SelectOption } from "naive-ui"
import { NButton } from "naive-ui"
import SubmissionResultTag from "oj/components/SubmissionResultTag.vue"
import Pagination from "~/shared/Pagination.vue"
import {
  submissionMemoryFormat,
  submissionTimeFormat,
  parseTime,
  filterEmptyValue,
} from "utils/functions"
import { Submission } from "utils/types"
import { getSubmissions } from "oj/api"
import { isDesktop } from "~/shared/composables/breakpoints"

interface Query {
  username: string
  result: string
  limit: number
  page: number
  myself: boolean
}

const route = useRoute()
const router = useRouter()
const problemID = <string>route.query.problem ?? ""
const contestID = <string>route.query.contest ?? ""

const submissions = ref([])
const total = ref(0)
const query = reactive<Query>({
  result: <string>route.query.result ?? "",
  page: parseInt(<string>route.query.page) || 1,
  limit: parseInt(<string>route.query.limit) || 10,
  username: <string>route.query.username ?? "",
  myself: route.query.myself === "1",
})

const options: SelectOption[] = [
  { label: "全部", value: "" },
  { label: "答案正确", value: "0" },
  { label: "答案错误", value: "-1" },
  { label: "编译失败", value: "-2" },
  { label: "运行时错误", value: "4" },
]

async function listSubmissions() {
  query.result = <string>route.query.result ?? ""
  query.page = parseInt(<string>route.query.page) || 1
  query.limit = parseInt(<string>route.query.limit) || 10
  query.username = <string>route.query.username ?? ""
  query.myself = route.query.myself === "1"

  if (query.page < 1) query.page = 1
  const offset = query.limit * (query.page - 1)
  const res = await getSubmissions({
    ...query,
    myself: query.myself ? "1" : "0",
    offset,
    problem_id: problemID,
    contest_id: contestID,
  })
  submissions.value = res.data.results
  total.value = res.data.total
}

onMounted(listSubmissions)

function routerPush() {
  const newQuery = {
    ...query,
    myself: query.myself ? "1" : "0",
  }
  router.push({
    path: route.path,
    query: filterEmptyValue(newQuery),
  })
}

function search(value: string) {
  query.username = value
}

function clear() {
  query.username = ""
  query.myself = false
  query.result = ""
}

watch(() => query.page, routerPush)

watch(
  () => [query.limit, query.myself, query.username, query.result],
  () => {
    query.page = 1
    routerPush()
  }
)

watch(
  () => route.path === "/status" && route.query,
  (newVal) => {
    if (newVal) listSubmissions()
  }
)

const columns: DataTableColumn<Submission>[] = [
  {
    title: "提交时间",
    key: "create_time",
    width: 180,
    render: (row) =>
      parseTime(row.create_time, isDesktop ? "YYYY-M-D hh:mm:ss" : "M-D hh:mm"),
  },
  {
    title: "编号",
    key: "id",
    render: (row) =>
      h(NButton, { text: true, type: "info" }, () => row.id.slice(0, 12)),
  },
  {
    title: "状态",
    key: "status",
    width: 120,
    render: (row) => h(SubmissionResultTag, { result: row.result }),
  },
  {
    title: "题目",
    key: "problem",
    width: 100,
    render: (row) =>
      h(
        NButton,
        {
          text: true,
          type: "info",
          onClick: () => router.push("/problem/" + row.problem),
        },
        () => row.problem
      ),
  },
  {
    title: "执行耗时",
    key: "time",
    width: 100,
    render: (row) => submissionTimeFormat(row.statistic_info.time_cost),
  },
  {
    title: "占用内存",
    key: "memory",
    width: 100,
    render: (row) => submissionMemoryFormat(row.statistic_info.memory_cost),
  },
  { title: "语言", key: "language", width: 100 },
  {
    title: "提交者",
    key: "username",
    minWidth: 120,
    render: (row) =>
      h(NButton, { text: true, type: "info" }, () => row.username),
  },
]
</script>
<template>
  <n-form :inline="isDesktop" label-placement="left">
    <n-form-item label="提交状态">
      <n-select
        class="select"
        v-model:value="query.result"
        :options="options"
      />
    </n-form-item>
    <n-form-item label="只看自己">
      <n-switch v-model:value="query.myself" />
    </n-form-item>
    <n-form-item label="搜索提交者">
      <n-input @change="search" clearable placeholder="输入后回车" />
    </n-form-item>
    <n-form-item>
      <n-space>
        <n-button @click="search(query.username)">搜索</n-button>
        <n-button @click="clear">重置</n-button>
      </n-space>
    </n-form-item>
  </n-form>
  <n-data-table striped size="small" :columns="columns" :data="submissions" />
  <Pagination
    :total="total"
    v-model:limit="query.limit"
    v-model:page="query.page"
  />
</template>
<style scoped>
.select {
  width: 120px;
}

.warning {
  color: red;
}
</style>

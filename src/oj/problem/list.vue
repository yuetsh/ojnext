<script setup lang="ts">
import { useUserStore } from "~/shared/store/user"
import { filterEmptyValue, getTagColor } from "utils/functions"
import { isDesktop } from "~/shared/composables/breakpoints"
import { getProblemList, getProblemTagList, getRandomProblemID } from "oj/api"

import Pagination from "~/shared/Pagination.vue"
import { DataTableColumn, NIcon, NSpace, NTag, useThemeVars } from "naive-ui"
import { Select, SemiSelect } from "@element-plus/icons-vue"

interface Query {
  keyword: string
  difficulty: string
  tag: string
  page: number
  limit: number
}

interface ProblemFiltered {
  _id: string
  title: string
  difficulty: "简单" | "中等" | "困难"
  tags: string[]
  submission: number
  rate: string
  status: "not_test" | "passed" | "failed"
}

const difficultyOptions = [
  { label: "全部", value: "" },
  { label: "简单", value: "Low" },
  { label: "中等", value: "Mid" },
  { label: "困难", value: "High" },
]

const router = useRouter()
const route = useRoute()
const theme = useThemeVars()
const userStore = useUserStore()
const problems = ref<ProblemFiltered[]>([])
const total = ref(0)

const { data } = getProblemTagList()

const tagOptions = computed(() => [
  { label: "全部", value: "" },
  ...(data.value?.map((t) => ({ label: t.name, value: t.name })) || []),
])

const query = reactive<Query>({
  keyword: <string>route.query.keyword ?? "",
  difficulty: <string>route.query.difficulty ?? "",
  tag: <string>route.query.tag ?? "",
  page: parseInt(<string>route.query.page) || 1,
  limit: parseInt(<string>route.query.limit) || 10,
})

async function listProblems() {
  query.keyword = <string>route.query.keyword ?? ""
  query.difficulty = <string>route.query.difficulty ?? ""
  query.tag = <string>route.query.tag ?? ""
  query.page = parseInt(<string>route.query.page) || 1
  query.limit = parseInt(<string>route.query.limit) || 10

  if (query.page < 1) query.page = 1
  const offset = (query.page - 1) * query.limit
  const res = await getProblemList(offset, query.limit, {
    keyword: query.keyword,
    tag: query.tag,
    difficulty: query.difficulty,
  })
  total.value = res.total
  problems.value = res.results
}

function routerPush() {
  router.push({
    path: route.path,
    query: filterEmptyValue(query),
  })
}

function search(value: string) {
  query.keyword = value
}

function clear() {
  query.keyword = ""
  query.tag = ""
  query.difficulty = ""
}

async function getRandom() {
  const res = await getRandomProblemID()
  router.push("/problem/" + res.data)
}

watch(() => query.page, routerPush)

watch(
  () => [query.tag, query.difficulty, query.limit, query.keyword],
  () => {
    query.page = 1
    routerPush()
  }
)

watch(
  () => route.path === "/" && route.query,
  (newVal) => {
    if (newVal) listProblems()
  }
)

// TODO: 这里会在登录时候执行两次，有BUG
watch(() => userStore.isFinished && userStore.isAuthed, listProblems)

onMounted(listProblems)

const columns: DataTableColumn<ProblemFiltered>[] = [
  {
    title: "状态",
    key: "status",
    width: 80,
    render: (row) => {
      if (row.status === "passed") {
        return h(NIcon, { color: theme.value.successColor }, () => h(Select))
      } else if (row.status === "failed") {
        return h(NIcon, { color: theme.value.errorColor }, () => h(SemiSelect))
      } else {
        return null
      }
    },
  },
  { title: "编号", key: "_id", width: 100 },
  { title: "标题", key: "title", minWidth: 200 },
  {
    title: "难度",
    key: "difficulty",
    width: 100,
    render: (row) =>
      h(NTag, { type: getTagColor(row.difficulty) }, () => row.difficulty),
  },
  {
    title: "标签",
    key: "tags",
    width: 260,
    render: (row) =>
      h(NSpace, () => row.tags.map((t) => h(NTag, { key: t }, () => t))),
  },
  { title: "提交数", key: "submission", width: 100 },
  { title: "通过率", key: "rate", width: 100 },
]

function rowProps(row: ProblemFiltered) {
  return {
    style: "cursor: pointer",
    onClick() {
      router.push("/problem/" + row._id)
    },
  }
}
</script>

<template>
  <n-form :inline="isDesktop" label-placement="left">
    <n-form-item label="难度">
      <n-select
        class="select"
        v-model:value="query.difficulty"
        :options="difficultyOptions"
      />
    </n-form-item>
    <n-form-item label="标签">
      <n-select
        class="select"
        v-model:value="query.tag"
        :options="tagOptions"
        clearable
      />
    </n-form-item>
    <n-form-item label="搜索">
      <n-input placeholder="输入编号或标题后回车" clearable @change="search" />
    </n-form-item>
    <n-form-item>
      <n-space>
        <n-button @click="search(query.keyword)">搜索</n-button>
        <n-button @click="clear">重置</n-button>
        <n-button @click="getRandom">随机一题</n-button>
      </n-space>
    </n-form-item>
  </n-form>
  <n-data-table
    striped
    size="small"
    :data="problems"
    :columns="columns"
    :row-props="rowProps"
  />
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
</style>

<script setup lang="ts">
import { NSwitch, NSelect, NTag } from "naive-ui"
import Pagination from "shared/components/Pagination.vue"
import { usePagination } from "shared/composables/pagination"
import { parseTime } from "utils/functions"
import { ProblemSetList } from "utils/types"
import {
  getProblemSetList,
  toggleProblemSetVisible,
  updateProblemSetStatus,
  deleteProblemSet,
} from "../api"
import Actions from "./components/Actions.vue"

const total = ref(0)
const problemSets = ref<ProblemSetList[]>([])

interface ProblemSetQuery {
  keyword: string
  difficulty: string
  status: string
}

// 使用分页 composable
const { query, clearQuery } = usePagination<ProblemSetQuery>({
  keyword: "",
  difficulty: "",
  status: "",
})

const difficultyOptions = [
  { label: "全部", value: "" },
  { label: "简单", value: "Easy" },
  { label: "中等", value: "Medium" },
  { label: "困难", value: "Hard" },
]

const statusOptions = [
  { label: "全部", value: "" },
  { label: "活跃", value: "active" },
  { label: "已归档", value: "archived" },
  { label: "草稿", value: "draft" },
]

const columns: DataTableColumn<ProblemSetList>[] = [
  { title: "ID", key: "id", width: 80 },
  { title: "标题", key: "title", minWidth: 200 },
  { title: "描述", key: "description", minWidth: 300, ellipsis: true },
  {
    title: "创建者",
    key: "created_by",
    width: 120,
    render: (row) => row.created_by.username,
  },
  {
    title: "难度",
    key: "difficulty",
    width: 100,
    render: (row) => {
      const difficultyMap = {
        Easy: { type: "success" as const, text: "简单" },
        Medium: { type: "warning" as const, text: "中等" },
        Hard: { type: "error" as const, text: "困难" },
      }
      const config = difficultyMap[row.difficulty]
      return h(NTag, { type: config.type }, { default: () => config.text })
    },
  },
  {
    title: "状态",
    key: "status",
    width: 100,
    render: (row) => {
      const statusMap = {
        active: { type: "success" as const, text: "活跃" },
        archived: { type: "default" as const, text: "已归档" },
        draft: { type: "info" as const, text: "草稿" },
      }
      const config = statusMap[row.status]
      return h(NTag, { type: config.type }, { default: () => config.text })
    },
  },
  {
    title: "题目数量",
    key: "problems_count",
    width: 100,
  },
  {
    title: "创建时间",
    key: "create_time",
    width: 180,
    render: (row) => parseTime(row.create_time, "YYYY-MM-DD HH:mm:ss"),
  },
  {
    title: "可见",
    key: "visible",
    width: 80,
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
    width: 300,
    render: (row) =>
      h(Actions, {
        problemSetId: row.id,
        onUpdated: listProblemSets,
      }),
  },
]

async function listProblemSets() {
  if (query.page < 1) query.page = 1
  const offset = (query.page - 1) * query.limit
  const res = await getProblemSetList(
    offset,
    query.limit,
    query.keyword,
    query.difficulty,
    query.status,
  )
  total.value = res.data.total
  problemSets.value = res.data.results
}

async function toggleVisible(problemSetId: number) {
  await toggleProblemSetVisible(problemSetId)
  problemSets.value = problemSets.value.map((it) => {
    if (it.id === problemSetId) {
      it.visible = !it.visible
    }
    return it
  })
}

onMounted(listProblemSets)

// 监听搜索关键词变化（防抖）
watchDebounced(() => query.keyword, listProblemSets, {
  debounce: 500,
  maxWait: 1000,
})

// 监听其他查询条件变化
watch(() => [query.page, query.limit, query.difficulty, query.status], listProblemSets)
</script>

<template>
  <n-flex class="titleWrapper" justify="space-between">
    <n-flex align="center">
      <h2 class="title">题单管理</h2>
      <n-button
        type="primary"
        @click="$router.push({ name: 'admin problemset create' })"
      >
        新建题单
      </n-button>
    </n-flex>
    <n-flex align="center">
      <n-flex align="center">
        <span>难度：</span>
        <n-select
          v-model:value="query.difficulty"
          :options="difficultyOptions"
          placeholder="选择难度"
          style="width: 120px"
          clearable
        />
      </n-flex>
      <n-flex align="center">
        <span>状态：</span>
        <n-select
          v-model:value="query.status"
          :options="statusOptions"
          placeholder="选择状态"
          style="width: 120px"
          clearable
        />
      </n-flex>
      <n-input
        v-model:value="query.keyword"
        placeholder="输入标题关键字"
        clearable
        @clear="clearQuery"
        style="width: 200px"
      />
    </n-flex>
  </n-flex>
  <n-data-table striped :columns="columns" :data="problemSets" />
  <Pagination
    :total="total"
    v-model:limit="query.limit"
    v-model:page="query.page"
  />
</template>

<style scoped>
.titleWrapper {
  margin-bottom: 16px;
}

.title {
  margin: 0;
}
</style>

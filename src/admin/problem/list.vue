<script setup lang="ts">
import { NSwitch } from "naive-ui"
import Pagination from "shared/components/Pagination.vue"
import { usePagination } from "shared/composables/pagination"
import { parseTime } from "utils/functions"
import { AdminProblemFiltered } from "utils/types"
import { getProblemList, toggleProblemVisible } from "../api"
import Actions from "./components/Actions.vue"
import Modal from "./components/Modal.vue"
import { useRouteQuery } from "@vueuse/router"
import AuthorSelect from "shared/components/AuthorSelect.vue"

interface Props {
  contestID?: string
}

const props = defineProps<Props>()
const route = useRoute()
const router = useRouter()

const title = computed(
  () =>
    ({
      "admin problem list": "题目列表",
      "admin contest problem list": "比赛题目列表",
    })[<string>route.name],
)
const isContestProblemList = computed(
  () => route.name === "admin contest problem list",
)

const [show, toggleShow] = useToggle()
const { count, inc } = useCounter(0)
const total = ref(0)
const problems = ref<AdminProblemFiltered[]>([])

interface ProblemQuery {
  keyword: string
  author: string
}

// 使用分页 composable
const { query, clearQuery } = usePagination<ProblemQuery>({
  keyword: useRouteQuery("keyword", "").value,
  author: useRouteQuery("author", "").value,
})

const columns: DataTableColumn<AdminProblemFiltered>[] = [
  { title: "ID", key: "id", width: 100 },
  { title: "显示编号", key: "_id", width: 100 },
  { title: "标题", key: "title", minWidth: 300 },
  { title: "出题人", key: "username", width: 160 },
  {
    title: "创建时间",
    key: "create_time",
    width: 200,
    render: (row) => parseTime(row.create_time, "YYYY-MM-DD HH:mm:ss"),
  },
  {
    title: "可见",
    key: "visible",
    minWidth: 80,
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
    width: 330,
    render: (row) =>
      h(Actions, {
        problemID: row.id,
        problemDisplayID: row._id,
        onUpdated: listProblems,
      }),
  },
]

async function listProblems() {
  if (query.page < 1) query.page = 1
  const offset = (query.page - 1) * query.limit
  const res = await getProblemList(
    offset,
    query.limit,
    query.keyword,
    query.author,
    props.contestID,
  )
  total.value = res.total
  problems.value = res.results
}

async function toggleVisible(problemID: number) {
  await toggleProblemVisible(problemID)
  problems.value = problems.value.map((it) => {
    if (it.id === problemID) {
      it.visible = !it.visible
    }
    return it
  })
}

function createContestProblem() {
  router.push({
    name: "admin contest problem create",
    params: { contestID: props.contestID },
  })
}

async function selectProblems() {
  toggleShow(true)
  inc()
}

onMounted(listProblems)

// 监听搜索关键词变化（防抖）
watchDebounced(() => query.keyword, listProblems, {
  debounce: 500,
  maxWait: 1000,
})

// 监听其他查询条件变化
watch(() => [query.page, query.limit, query.author], listProblems)
</script>

<template>
  <n-flex class="titleWrapper" justify="space-between">
    <n-flex align="center">
      <h2 class="title">{{ title }}</h2>
      <n-button
        v-if="!isContestProblemList"
        type="primary"
        @click="$router.push({ name: 'admin problem create' })"
      >
        新建
      </n-button>
    </n-flex>
    <n-flex>
      <n-button v-if="isContestProblemList" @click="createContestProblem">
        新建比赛题目
      </n-button>
      <n-button
        v-if="isContestProblemList"
        type="primary"
        @click="selectProblems"
      >
        从题目中选择
      </n-button>
      <n-flex align="center" v-if="!props.contestID">
        <span>出题人</span>
        <AuthorSelect v-model:value="query.author" all />
      </n-flex>
      <div>
        <n-input
          v-model:value="query.keyword"
          placeholder="输入标题关键字"
          clearable
          @clear="clearQuery"
        />
      </div>
    </n-flex>
  </n-flex>
  <n-data-table striped :columns="columns" :data="problems" />
  <Pagination
    :total="total"
    v-model:limit="query.limit"
    v-model:page="query.page"
  />
  <Modal v-model:show="show" :count="count" @change="listProblems" />
</template>

<style scoped>
.titleWrapper {
  margin-bottom: 16px;
}

.title {
  margin: 0;
}
</style>

<script setup lang="ts">
import { NFlex, NSwitch, NTag, NTooltip } from "naive-ui"
import { Icon } from "@iconify/vue"
import Pagination from "shared/components/Pagination.vue"
import { usePagination } from "shared/composables/pagination"
import { getTagColor, parseTime } from "utils/functions"
import type { AdminProblemFiltered } from "utils/types"
import { DIFFICULTY, REACTIONS } from "utils/constants"
import { getProblemList, toggleProblemVisible } from "../api"
import Actions from "./components/Actions.vue"
import Modal from "./components/Modal.vue"
import { useRouteQuery } from "@vueuse/router"
import AuthorSelect from "shared/components/AuthorSelect.vue"
import type { DataTableRowKey } from "naive-ui"
import BatchTagModal from "./components/BatchTagModal.vue"

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
    })[route.name as string],
)
const isContestProblemList = computed(
  () => route.name === "admin contest problem list",
)

const [show, toggleShow] = useToggle()
const { count, inc } = useCounter(0)
const total = ref(0)
const problems = ref<AdminProblemFiltered[]>([])

const selectedRowKeys = ref<DataTableRowKey[]>([])
const batchTagAction = ref<"add" | "remove">("add")
const [showBatchTag, toggleBatchTag] = useToggle(false)

const selectedProblemIds = computed(() =>
  selectedRowKeys.value.map((key) => Number(key)),
)

const rowKey = (row: AdminProblemFiltered) => row.id

function chooseProblems(rowKeys: DataTableRowKey[]) {
  selectedRowKeys.value = rowKeys
}

function openBatchTag(action: "add" | "remove") {
  batchTagAction.value = action
  toggleBatchTag(true)
}

function onBatchTagDone() {
  selectedRowKeys.value = []
  listProblems()
}

const nextDisplayID = computed(() => {
  if (!isContestProblemList.value) return ""
  if (problems.value.length === 0) return "1"
  const ids = problems.value.map((p) => p._id)
  if (ids.every((id) => /^\d+$/.test(id))) {
    return String(Math.max(...ids.map((id) => parseInt(id))) + 1)
  }
  return ""
})

interface ProblemQuery {
  keyword: string
  author: string
}

// 使用分页 composable
const { query, clearQuery } = usePagination<ProblemQuery>({
  keyword: useRouteQuery("keyword", "").value,
  author: useRouteQuery("author", "").value,
})

const baseColumns: DataTableColumn<AdminProblemFiltered>[] = [
  { title: "ID", key: "id", width: 100 },
  { title: "显示编号", key: "_id", width: 100 },
  { title: "标题", key: "title", minWidth: 200 },
  {
    title: "难度",
    key: "difficulty",
    width: 80,
    render: (row) =>
      h(
        NTag,
        { type: getTagColor(row.difficulty), size: "small" },
        () => DIFFICULTY[row.difficulty],
      ),
  },
  {
    title: "标签",
    key: "tags",
    minWidth: 120,
    render: (row) =>
      h(NFlex, { size: 4 }, () =>
        row.tags.map((t) => h(NTag, { key: t, size: "small" }, () => t)),
      ),
  },
  {
    title: "功能",
    key: "features",
    width: 80,
    render: (row) =>
      h(NFlex, { size: 4, align: "center" }, () => [
        row.allow_flowchart
          ? h(Icon, {
              width: 18,
              icon: "vscode-icons:file-type-drawio",
              title: "绘图",
            })
          : row.show_flowchart
            ? h(Icon, {
                width: 18,
                icon: "vscode-icons:file-type-graphql",
                title: "流程图",
              })
            : null,
        row.has_ast_rules
          ? h(Icon, {
              width: 18,
              icon: "vscode-icons:file-type-light-todo",
              title: "AST",
            })
          : null,
      ]),
  },
  {
    title: "反馈",
    key: "top_reaction",
    width: 60,
    render: (row) => {
      const top = row.top_reaction
      if (!top) return null
      const reaction = REACTIONS.find((it) => it.key === top.type)
      if (!reaction) return null
      return h(NTooltip, null, {
        trigger: () => h(Icon, { width: 18, icon: reaction.icon }),
        default: () => `${reaction.label} ${top.count} 人`,
      })
    },
  },
  { title: "出题人", key: "username", width: 120 },
  {
    title: "创建时间",
    key: "create_time",
    width: 200,
    render: (row) => parseTime(row.create_time, "YYYY-MM-DD HH:mm:ss"),
  },
  {
    title: "可见",
    key: "visible",
    minWidth: 100,
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
    width: 320,
    render: (row) =>
      h(Actions, {
        problemID: row.id,
        problemDisplayID: row._id,
        onUpdated: listProblems,
      }),
  },
]

// 比赛题目接口不返回 top_reaction，这一列只在普通题目列表里显示
const columns = computed<DataTableColumn<AdminProblemFiltered>[]>(() =>
  isContestProblemList.value
    ? baseColumns.filter((it) => !("key" in it) || it.key !== "top_reaction")
    : [{ type: "selection" }, ...baseColumns],
)

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
      <n-button
        v-if="!isContestProblemList"
        @click="$router.push({ name: 'admin stuck problems' })"
      >
        卡点分析
      </n-button>
      <n-button
        v-if="!isContestProblemList"
        @click="$router.push({ name: 'admin top ac trend' })"
      >
        年度趋势
      </n-button>
      <n-button
        v-if="!isContestProblemList"
        @click="$router.push({ name: 'admin tag list' })"
      >
        标签管理
      </n-button>
    </n-flex>
    <n-flex>
      <template v-if="!isContestProblemList && selectedProblemIds.length">
        <n-button type="primary" @click="openBatchTag('add')">
          添加标签（{{ selectedProblemIds.length }}）
        </n-button>
        <n-button @click="openBatchTag('remove')">移除标签</n-button>
      </template>
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
  <n-data-table
    striped
    :columns="columns"
    :data="problems"
    :row-key="rowKey"
    @update:checked-row-keys="chooseProblems"
  />
  <Pagination
    :total="total"
    v-model:limit="query.limit"
    v-model:page="query.page"
  />
  <Modal
    v-model:show="show"
    :count="count"
    :next-display-id="nextDisplayID"
    @change="listProblems"
  />
  <BatchTagModal
    v-model:show="showBatchTag"
    :problem-ids="selectedProblemIds"
    :action="batchTagAction"
    @done="onBatchTagDone"
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

<script setup lang="ts">
import { getProblemList, getProblem, editProblem } from "../api"
import Pagination from "~/shared/components/Pagination.vue"
import { NSwitch } from "naive-ui"
import { AdminProblemFiltered } from "~/utils/types"
import { parseTime } from "~/utils/functions"
import Actions from "./components/Actions.vue"
import Modal from "./components/Modal.vue"

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
const query = reactive({
  limit: 10,
  page: 1,
  keyword: "",
})

const columns: DataTableColumn<AdminProblemFiltered>[] = [
  { title: "ID", key: "id", width: 80 },
  { title: "显示编号", key: "_id", width: 100 },
  { title: "标题", key: "title", minWidth: 300 },
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
    width: 250,
    render: (row) =>
      h(Actions, {
        problemID: row.id,
        problemDisplayID: row._id,
        onDeleted: listProblems,
      }),
  },
]

async function listProblems() {
  const offset = (query.page - 1) * query.limit
  const res = await getProblemList(
    offset,
    query.limit,
    query.keyword,
    props.contestID,
  )
  total.value = res.total
  problems.value = res.results
}

// 这里比较傻逼，因为我传进来的时候 filter 了而且只有 edit problem 一个接口，所以只能先 get 再 edit
async function toggleVisible(problemID: number) {
  const res = await getProblem(problemID)
  await editProblem({ ...res.data, visible: !res.data.visible })
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
watch(query, listProblems, { deep: true })
</script>

<template>
  <n-space class="titleWrapper" justify="space-between">
    <h2 class="title">{{ title }}</h2>
    <n-space>
      <n-button v-if="isContestProblemList" @click="createContestProblem">
        新建比赛题目
      </n-button>
      <n-button
        v-if="isContestProblemList"
        type="primary"
        @click="selectProblems"
      >
        从题库中选择
      </n-button>
      <n-input v-model:value="query.keyword" placeholder="输入标题关键字" />
    </n-space>
  </n-space>
  <n-data-table striped size="small" :columns="columns" :data="problems" />
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

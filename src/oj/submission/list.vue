<script setup lang="ts">
import { NButton, NH2, NText } from "naive-ui"
import { adminRejudge, getSubmissions, getTodaySubmissionCount } from "oj/api"
import { filterEmptyValue, parseTime } from "utils/functions"
import { LANGUAGE, Submission } from "utils/types"
import Pagination from "~/shared/components/Pagination.vue"
import SubmissionResultTag from "~/shared/components/SubmissionResultTag.vue"
import { isDesktop } from "~/shared/composables/breakpoints"
import { useUserStore } from "~/shared/store/user"
import { LANGUAGE_SHOW_VALUE } from "~/utils/constants"
import { renderTableTitle } from "~/utils/renders"
import ButtonWithSearch from "./components/ButtonWithSearch.vue"
import StatisticsPanel from "./components/StatisticsPanel.vue"
import SubmissionLink from "./components/SubmissionLink.vue"
import SubmissionDetail from "./detail.vue"

interface Query {
  username: string
  result: string
  limit: number
  page: number
  myself: boolean
  problem: string
  language: LANGUAGE | ""
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const message = useMessage()

const submissions = ref([])
const total = ref(0)
const todayCount = ref(0)
const query = reactive<Query>({
  result: <string>route.query.result ?? "",
  page: parseInt(<string>route.query.page) || 1,
  limit: parseInt(<string>route.query.limit) || 10,
  username: <string>route.query.username ?? "",
  myself: route.query.myself === "1",
  problem: <string>route.query.problem ?? "",
  language: <LANGUAGE | "">route.query.language ?? "",
})
const submissionID = ref("")
const [statisticPanel, toggleStatisticPanel] = useToggle(false)
const [codePanel, toggleCodePanel] = useToggle(false)

const resultOptions: SelectOption[] = [
  { label: "全部", value: "" },
  { label: "答案正确", value: "0" },
  { label: "答案错误", value: "-1" },
  { label: "编译失败", value: "-2" },
  { label: "运行时错误", value: "4" },
]

const languageOptions: SelectOption[] = [
  { label: "全部", value: "" },
  { label: "Python", value: "Python3" },
  { label: "C语言", value: "C" },
  { label: "C++", value: "C++" },
]
async function listSubmissions() {
  query.result = <string>route.query.result ?? ""
  query.page = parseInt(<string>route.query.page) || 1
  query.limit = parseInt(<string>route.query.limit) || 10
  query.username = <string>route.query.username ?? ""
  query.myself = route.query.myself === "1"
  query.problem = <string>route.query.problem ?? ""
  query.language = <LANGUAGE>route.query.language ?? ""

  if (query.page < 1) query.page = 1
  const offset = query.limit * (query.page - 1)
  const res = await getSubmissions({
    ...query,
    myself: query.myself ? "1" : "0",
    offset,
    problem_id: <string>route.query.problem ?? "",
    contest_id: <string>route.params.contestID ?? "",
    language: query.language,
  })
  submissions.value = res.data.results
  total.value = res.data.total
}

async function getTodayCount() {
  const res = await getTodaySubmissionCount()
  todayCount.value = res.data
}

onMounted(() => {
  listSubmissions()
  if (route.name === "submissions") {
    getTodayCount()
  }
})

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

function search(username: string, problem: string) {
  query.username = username
  query.problem = problem
}

function clear() {
  query.username = ""
  query.myself = false
  query.result = ""
  query.problem = ""
  query.language = ""
}

async function rejudge(submissionID: string) {
  await adminRejudge(submissionID)
  message.success("重新判分成功")
  listSubmissions()
}

function problemClicked(row: Submission) {
  if (route.name === "contest submissions") {
    const path = router.resolve({
      name: "contest problem",
      params: {
        problemID: row.problem,
      },
    })
    window.open(path.href, "_blank")
  } else {
    window.open("/problem/" + row.problem, "_blank")
  }
}

function showCodePanel(id: string) {
  toggleCodePanel(true)
  submissionID.value = id
}

watch(() => query.page, routerPush)

watch(
  () => [query.limit, query.myself, query.result, query.language],
  () => {
    query.page = 1
    routerPush()
  },
)

watchDebounced(
  () => [query.username, query.problem],
  () => {
    query.page = 1
    routerPush()
  },
  { debounce: 500, maxWait: 1000 },
)

watch(
  () =>
    (route.name === "submissions" || route.name === "contest submissions") &&
    route.query,
  (newVal) => {
    if (newVal) listSubmissions()
  },
)

const columns = computed(() => {
  const res: DataTableColumn<Submission>[] = [
    {
      title: renderTableTitle("提交时间", "noto:seven-oclock"),
      key: "create_time",
      width: 200,
      render: (row) => parseTime(row.create_time, "YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: renderTableTitle("提交编号", "fluent-emoji-flat:input-numbers"),
      key: "id",
      minWidth: 160,
      render: (row) =>
        h(SubmissionLink, {
          submission: row,
          onShowCode: () => showCodePanel(row.id),
        }),
    },
    {
      title: renderTableTitle("状态", "streamline-emojis:panda-face"),
      key: "status",
      width: 160,
      render: (row) => h(SubmissionResultTag, { result: row.result }),
    },
    {
      title: renderTableTitle("题目", "streamline-emojis:blossom"),
      key: "problem",
      width: 160,
      render: (row) =>
        h(
          ButtonWithSearch,
          {
            onClick: () => problemClicked(row),
            onSearch: () => (query.problem = row.problem),
          },
          () => row.problem,
        ),
    },
    {
      title: renderTableTitle(
        "语言",
        "streamline-emojis:globe-showing-europe-africa",
      ),
      key: "language",
      width: 120,
      render: (row) => LANGUAGE_SHOW_VALUE[row.language],
    },
    {
      title: renderTableTitle(
        "用户",
        "streamline-emojis:smiling-face-with-sunglasses",
      ),
      key: "username",
      minWidth: 160,
      render: (row) =>
        h(
          ButtonWithSearch,
          {
            onClick: () => window.open("/user?name=" + row.username, "_blank"),
            onSearch: () => (query.username = row.username),
          },
          () => row.username,
        ),
    },
  ]
  if (!route.params.contestID && userStore.isSuperAdmin) {
    res.push({
      title: renderTableTitle("选项", "streamline-emojis:wrench"),
      key: "rejudge",
      render: (row) =>
        h(
          NButton,
          {
            quaternary: true,
            size: "small",
            type: "primary",
            onClick: () => rejudge(row.id),
          },
          () => "重新判题",
        ),
    })
  }
  return res
})
</script>
<template>
  <n-flex vertical size="large">
    <n-space>
      <n-form :show-feedback="false" inline label-placement="left">
        <n-form-item label="提交状态">
          <n-select
            class="select"
            v-model:value="query.result"
            :options="resultOptions"
          />
        </n-form-item>
        <n-form-item label="编程语言">
          <n-select
            class="select"
            v-model:value="query.language"
            :options="languageOptions"
          />
        </n-form-item>
        <n-form-item v-if="userStore.isAuthed" label="只看自己">
          <n-switch v-model:value="query.myself" />
        </n-form-item>
      </n-form>
      <n-form :show-feedback="false" inline label-placement="left">
        <n-form-item>
          <n-input
            class="input"
            clearable
            v-model:value="query.username"
            placeholder="用户"
          />
        </n-form-item>
        <n-form-item>
          <n-input
            class="input"
            clearable
            v-model:value="query.problem"
            placeholder="题号"
          />
        </n-form-item>
      </n-form>
      <n-form :show-feedback="false" inline label-placement="left">
        <n-form-item>
          <n-button @click="search(query.username, query.problem)">
            搜索
          </n-button>
        </n-form-item>
        <n-form-item
          v-if="userStore.isSuperAdmin && route.name === 'submissions'"
        >
          <n-button @click="toggleStatisticPanel(true)">数据统计</n-button>
        </n-form-item>
        <n-form-item>
          <n-button @click="clear" quaternary>重置</n-button>
        </n-form-item>
        <n-form-item v-if="todayCount > 0">
          <component :is="isDesktop ? NH2 : NText" class="todayCount">
            <n-gradient-text>今日提交数：{{ todayCount }}</n-gradient-text>
          </component>
        </n-form-item>
      </n-form>
    </n-space>
    <n-data-table :bordered="false" :columns="columns" :data="submissions" />
  </n-flex>
  <Pagination
    :total="total"
    v-model:limit="query.limit"
    v-model:page="query.page"
  />
  <n-modal
    v-if="userStore.isSuperAdmin"
    v-model:show="statisticPanel"
    preset="card"
    :style="{ maxWidth: isDesktop && '70vw', maxHeight: '80vh' }"
    :content-style="{ overflow: 'auto' }"
    title="提交记录的统计"
  >
    <StatisticsPanel :problem="query.problem" :username="query.username" />
  </n-modal>
  <n-modal
    v-model:show="codePanel"
    preset="card"
    :style="{ maxWidth: isDesktop && '70vw', maxHeight: '80vh' }"
    :content-style="{ overflow: 'auto' }"
    title="代码详情"
  >
    <SubmissionDetail :submissionID="submissionID" hideList />
  </n-modal>
</template>
<style scoped>
.select {
  width: 120px;
}

.input {
  width: 200px;
}

.code {
  font-size: 20px;
  overflow: auto;
}

.todayCount {
  margin: 0;
}
</style>

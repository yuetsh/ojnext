<script setup lang="ts">
import { NButton } from "naive-ui"
import SubmissionResultTag from "~/shared/components/SubmissionResultTag.vue"
import Pagination from "~/shared/components/Pagination.vue"
import {
  submissionMemoryFormat,
  submissionTimeFormat,
  parseTime,
  filterEmptyValue,
} from "utils/functions"
import { Submission } from "utils/types"
import { adminRejudge, getSubmissions } from "oj/api"
import { isDesktop } from "~/shared/composables/breakpoints"
import { useUserStore } from "~/shared/store/user"
import { LANGUAGE_SHOW_VALUE } from "~/utils/constants"

interface Query {
  username: string
  result: string
  limit: number
  page: number
  myself: boolean
  problem: string
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const message = useMessage()

const submissions = ref([])
const total = ref(0)
const query = reactive<Query>({
  result: <string>route.query.result ?? "",
  page: parseInt(<string>route.query.page) || 1,
  limit: parseInt(<string>route.query.limit) || 10,
  username: <string>route.query.username ?? "",
  myself: route.query.myself === "1",
  problem: <string>route.query.problem ?? "",
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
  query.problem = <string>route.query.problem ?? ""

  if (query.page < 1) query.page = 1
  const offset = query.limit * (query.page - 1)
  const res = await getSubmissions({
    ...query,
    myself: query.myself ? "1" : "0",
    offset,
    problem_id: <string>route.query.problem ?? "",
    contest_id: <string>route.params.contestID ?? "",
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

function searchUser(value: string) {
  query.username = value
}

function searchProblem(value: string) {
  query.problem = value
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
}

async function rejudge(submissionID: string) {
  await adminRejudge(submissionID)
  message.success("重新判分成功")
  listSubmissions()
}

watch(() => query.page, routerPush)

watch(
  () => [
    query.limit,
    query.myself,
    query.username,
    query.result,
    query.problem,
  ],
  () => {
    query.page = 1
    routerPush()
  },
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
      title: "提交时间",
      key: "create_time",
      width: 200,
      render: (row) =>
        parseTime(
          row.create_time,
          isDesktop ? "YYYY-MM-DD HH:mm:ss" : "M-D hh:mm",
        ),
    },
    {
      title: "提交编号",
      key: "id",
      minWidth: 160,
      render: (row) => {
        if (row.show_link) {
          return h(
            NButton,
            {
              text: true,
              type: "info",
              onClick: () => router.push("/submission/" + row.id),
            },
            () => row.id.slice(0, 12),
          )
        } else {
          return row.id.slice(0, 12)
        }
      },
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
      width: 120,
      render: (row) =>
        h(
          NButton,
          {
            text: true,
            type: "info",
            onClick: () => {
              if (route.name === "contest submissions") {
                router.push({
                  name: "contest problem",
                  params: {
                    problemID: row.problem,
                  },
                })
              } else {
                router.push("/problem/" + row.problem)
              }
            },
          },
          () => row.problem,
        ),
    },
    {
      title: "执行耗时",
      key: "time",
      width: 120,
      render: (row) => submissionTimeFormat(row.statistic_info.time_cost),
    },
    {
      title: "占用内存",
      key: "memory",
      width: 120,
      render: (row) => submissionMemoryFormat(row.statistic_info.memory_cost),
    },
    {
      title: "语言",
      key: "language",
      width: 120,
      render: (row) => LANGUAGE_SHOW_VALUE[row.language],
    },
    {
      title: "用户",
      key: "username",
      minWidth: 120,
      render: (row) =>
        h(
          NButton,
          {
            text: true,
            type: "info",
            onClick: () => router.push("/user?name=" + row.username),
          },
          () => row.username,
        ),
    },
  ]
  if (!route.params.contestID && userStore.isSuperAdmin) {
    res.push({
      title: "选项",
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
  <n-space vertical size="large">
    <n-space>
      <n-form :show-feedback="false" inline label-placement="left">
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
      </n-form>
      <n-form :show-feedback="false" inline label-placement="left">
        <n-form-item>
          <n-input clearable @change="searchUser" placeholder="用户" />
        </n-form-item>
        <n-form-item>
          <n-input clearable @change="searchProblem" placeholder="题号" />
        </n-form-item>
      </n-form>
      <n-form :show-feedback="false" inline label-placement="left">
        <n-form-item>
          <n-button @click="search(query.username, query.problem)">
            搜索
          </n-button>
        </n-form-item>
        <n-form-item>
          <n-button @click="clear" quaternary>重置</n-button>
        </n-form-item>
      </n-form>
    </n-space>
    <n-data-table striped :columns="columns" :data="submissions" />
  </n-space>
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

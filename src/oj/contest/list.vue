<script setup lang="ts">
import { DataTableColumn, NTag, SelectOption } from "naive-ui"
import { getContestList } from "oj/api"
import Pagination from "~/shared/Pagination.vue"
import { filterEmptyValue, parseTime, duration } from "utils/functions"
import { Contest } from "utils/types"
import { CONTEST_STATUS } from "~/utils/constants"
import ContestTitle from "./components/ContestTitle.vue"
import { useUserStore } from "~/shared/store/user"
import { toggleLogin } from "~/shared/composables/modal"

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const query = reactive({
  page: parseInt(<string>route.query.page) || 1,
  limit: parseInt(<string>route.query.limit) || 10,
  keyword: <string>route.query.keyword ?? "",
  status: <string>route.query.status ?? "",
})
const data = ref<Contest[]>([])
const total = ref(0)

const options: SelectOption[] = [
  { label: "全部", value: "" },
  { label: "未开始", value: "1" },
  { label: "进行中", value: "0" },
  { label: "已结束", value: "-1" },
]

const columns: DataTableColumn<Contest>[] = [
  {
    title: "比赛",
    key: "title",
    minWidth: 360,
    render: (row) => h(ContestTitle, { contest: row }),
  },
  {
    title: "开始时间",
    key: "start_time",
    width: 180,
    render: (row) => parseTime(row.start_time),
  },
  {
    title: "比赛时长",
    key: "duration",
    width: 180,
    render: (row) => duration(row.start_time, row.end_time),
  },
  {
    title: "状态",
    key: "status",
    width: 100,
    render: (row) =>
      h(
        NTag,
        { type: CONTEST_STATUS[row.status]["type"] },
        () => CONTEST_STATUS[row.status]["name"]
      ),
  },
]

async function listContests() {
  const offset = (query.page - 1) * query.limit
  const res = await getContestList({
    offset,
    limit: query.limit,
    keyword: query.keyword,
    status: query.status,
  })
  data.value = res.data.results
  total.value = res.data.total
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
  query.status = ""
}

onMounted(listContests)
watch(() => query.page, routerPush)
watch(
  () => [query.limit, query.keyword, query.status],
  () => {
    query.page = 1
    routerPush()
  }
)
watch(
  () => route.path === "/contest" && route.query,
  (newVal) => {
    if (newVal) listContests()
  }
)

function rowProps(row: Contest) {
  return {
    style: "cursor: pointer",
    onClick() {
      if (!userStore.isAuthed && row.contest_type === "Password Protected") {
        toggleLogin(true)
      } else {
        router.push("/contest/" + row.id)
      }
    },
  }
}
</script>
<template>
  <n-form label-placement="left" inline>
    <n-form-item label="状态">
      <n-select
        class="select"
        :options="options"
        v-model:value="query.status"
      />
    </n-form-item>
    <n-form-item>
      <n-input
        placeholder="关键字"
        v-model:value="query.keyword"
        @change="search"
      />
    </n-form-item>
    <n-form-item>
      <n-space>
        <n-button @click="search(query.keyword)">搜索</n-button>
        <n-button @click="clear">重置</n-button>
      </n-space>
    </n-form-item>
  </n-form>
  <n-data-table
    size="small"
    striped
    :columns="columns"
    :data="data"
    :row-props="rowProps"
  />
  <Pagination
    v-model:limit="query.limit"
    v-model:page="query.page"
    :total="total"
  />
</template>

<style scoped>
.select {
  width: 120px;
}
</style>

<script setup lang="ts">
import { NTag } from "naive-ui"
import { getContestList } from "oj/api"
import { filterEmptyValue, parseTime, duration } from "utils/functions"
import { Contest } from "utils/types"
import { ContestType, CONTEST_STATUS } from "~/utils/constants"
import ContestTitle from "~/shared/components/ContestTitle.vue"
import Pagination from "~/shared/components/Pagination.vue"
import { useUserStore } from "~/shared/store/user"
import { toggleLogin } from "~/shared/composables/modal"
import { renderTableTitle } from "~/utils/renders"

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const query = reactive({
  page: parseInt(<string>route.query.page) || 1,
  limit: parseInt(<string>route.query.limit) || 10,
  keyword: <string>route.query.keyword ?? "",
  status: <string>route.query.status ?? "",
  tag: <string>route.query.tag ?? "",
})
const data = ref<Contest[]>([])
const total = ref(0)

const options: SelectOption[] = [
  { label: "全部", value: "" },
  { label: "未开始", value: "1" },
  { label: "进行中", value: "0" },
  { label: "已结束", value: "-1" },
]

const tags: SelectOption[] = [
  { label: "全部", value: "" },
  { label: "练习", value: "练习" },
  { label: "期中", value: "期中" },
  { label: "期末", value: "期末" },
]

const columns: DataTableColumn<Contest>[] = [
  {
    title: renderTableTitle("状态", "streamline-emojis:collision"),
    key: "status",
    width: 100,
    render: (row) =>
      h(
        NTag,
        { type: CONTEST_STATUS[row.status]["type"] },
        () => CONTEST_STATUS[row.status]["name"],
      ),
  },
  {
    title: renderTableTitle("比赛", "streamline-emojis:bouquet"),
    key: "title",
    minWidth: 360,
    render: (row) => h(ContestTitle, { contest: row }),
  },
  {
    title: renderTableTitle("标签", "fluent-emoji-flat:keycap-hashtag"),
    key: "tag",
    width: 100,
    render: (row) => h(NTag, () => row.tag),
  },
  {
    title: renderTableTitle("开始时间", "fluent-emoji-flat:eleven-thirty"),
    key: "start_time",
    width: 180,
    render: (row) => parseTime(row.start_time),
  },
  {
    title: renderTableTitle("比赛时长", "streamline-emojis:fishing-pole"),
    key: "duration",
    width: 180,
    render: (row) => duration(row.start_time, row.end_time),
  },
]

async function listContests() {
  const offset = (query.page - 1) * query.limit
  const res = await getContestList({
    offset,
    limit: query.limit,
    keyword: query.keyword,
    status: query.status,
    tag: query.tag,
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
  query.tag = ""
}

onMounted(listContests)
watch(() => query.page, routerPush)
watch(
  () => [query.limit, query.status, query.tag],
  () => {
    query.page = 1
    routerPush()
  },
)
watchDebounced(
  () => [query.keyword],
  () => {
    query.page = 1
    routerPush()
  },
  { debounce: 500, maxWait: 1000 },
)
watch(
  () => route.name === "contests" && route.query,
  (newVal) => {
    if (newVal) listContests()
  },
)

function rowProps(row: Contest) {
  return {
    style: "cursor: pointer",
    onClick() {
      if (!userStore.isAuthed && row.contest_type === ContestType.private) {
        toggleLogin(true)
      } else {
        router.push("/contest/" + row.id)
      }
    },
  }
}
</script>
<template>
  <n-flex vertical size="large">
    <n-space>
      <n-form :show-feedback="false" label-placement="left" inline>
        <n-form-item label="比赛状态">
          <n-select
            class="select"
            :options="options"
            v-model:value="query.status"
          />
        </n-form-item>
        <n-form-item label="标签">
          <n-select class="select" :options="tags" v-model:value="query.tag" />
        </n-form-item>
        <n-form-item>
          <n-input
            clearable
            v-model:value="query.keyword"
            placeholder="比赛标题"
          />
        </n-form-item>
      </n-form>
      <n-form :show-feedback="false" label-placement="left" inline>
        <n-form-item>
          <n-flex>
            <n-button @click="search(query.keyword)">搜索</n-button>
            <n-button @click="clear" quaternary>重置</n-button>
          </n-flex>
        </n-form-item>
      </n-form>
    </n-space>
    <n-data-table
      striped
      :columns="columns"
      :data="data"
      :row-props="rowProps"
    />
  </n-flex>
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

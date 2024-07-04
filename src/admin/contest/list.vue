<script setup lang="ts">
import { NSwitch, NTag } from "naive-ui"
import ContestTitle from "~/shared/components/ContestTitle.vue"
import ContestType from "~/shared/components/ContestType.vue"
import Pagination from "~/shared/components/Pagination.vue"
import { CONTEST_STATUS } from "~/utils/constants"
import { Contest } from "~/utils/types"
import { editContest, getContestList } from "../api"
import Actions from "./components/Actions.vue"

const contests = ref<Contest[]>([])
const total = ref(0)
const query = reactive({
  limit: 10,
  page: 1,
  keyword: "",
})

function toggleVisible(contest: Contest) {
  contest.visible = !contest.visible
  editContest(contest)
}

const columns: DataTableColumn<Contest>[] = [
  { title: "ID", key: "id", width: 60 },
  {
    title: "比赛",
    key: "title",
    minWidth: 250,
    render: (row) => h(ContestTitle, { contest: row }),
  },
  {
    title: "标签",
    key: "tag",
    width: 80,
  },
  {
    title: "类型",
    key: "contest_type",
    width: 80,
    render: (row) => h(ContestType, { contest: row, size: "small" }),
  },
  {
    title: "状态",
    key: "status",
    width: 80,
    render: (row) =>
      h(
        NTag,
        { type: CONTEST_STATUS[row.status]["type"], size: "small" },
        () => CONTEST_STATUS[row.status]["name"],
      ),
  },
  {
    title: "可见",
    key: "visible",
    width: 60,
    render: (row) =>
      h(NSwitch, {
        value: row.visible,
        size: "small",
        rubberBand: false,
        onUpdateValue: () => toggleVisible(row),
      }),
  },
  {
    title: "选项",
    key: "actions",
    width: 140,
    render: (row) => h(Actions, { contest: row }),
  },
]

async function listContests() {
  const offset = (query.page - 1) * query.limit
  const res = await getContestList(offset, query.limit, query.keyword)
  contests.value = res.data.results
  total.value = res.data.total
}
onMounted(listContests)
watch(() => [query.page, query.limit], listContests)
watchDebounced(() => query.keyword, listContests, {
  debounce: 500,
  maxWait: 1000,
})
</script>

<template>
  <n-flex justify="space-between" class="titleWrapper">
    <h2 class="title">比赛列表</h2>
    <div>
      <n-input v-model:value="query.keyword" placeholder="输入标题关键字" />
    </div>
  </n-flex>
  <n-data-table :columns="columns" :data="contests" />
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

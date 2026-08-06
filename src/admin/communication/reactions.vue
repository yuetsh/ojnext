<template>
  <n-flex justify="space-between" class="titleWrapper">
    <h2 class="title">题目反馈统计</h2>
    <div>
      <n-input
        v-model:value="query.problem"
        clearable
        placeholder="输入题目序号"
      />
    </div>
  </n-flex>
  <n-data-table
    striped
    :columns="columns"
    :data="rows"
    :scroll-x="1100"
    remote
    @update:sorter="handleSorter"
  />
  <Pagination
    :total="total"
    v-model:limit="query.limit"
    v-model:page="query.page"
  />
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { NButton, NFlex } from "naive-ui"
import Pagination from "shared/components/Pagination.vue"
import { REACTIONS } from "utils/constants"
import type { ReactionStatsRow } from "utils/types"
import { getReactionStats } from "../api"

const rows = ref<ReactionStatsRow[]>([])
const total = ref(0)
const query = reactive({
  limit: 10,
  page: 1,
  problem: "",
  ordering: "-users",
})

const columns: DataTableColumn<ReactionStatsRow>[] = [
  {
    title: "题目",
    key: "pid",
    width: 100,
    fixed: "left",
    render: (row) =>
      h(
        NButton,
        {
          text: true,
          type: "info",
          onClick: () => window.open("/problem/" + row.pid, "_blank"),
        },
        () => row.pid,
      ),
  },
  { title: "标题", key: "title", minWidth: 180, ellipsis: true },
  { title: "表态人数", key: "users", width: 110, sorter: true },
  ...REACTIONS.map((item) => ({
    title: () =>
      h(NFlex, { align: "center", size: 4, wrap: false }, () => [
        h(Icon, { icon: item.icon, width: 18 }),
        item.label,
      ]),
    key: item.key,
    width: 110,
    sorter: true,
  })),
]

function handleSorter(sorter: { columnKey: string; order: string | false }) {
  if (!sorter || !sorter.order) {
    query.ordering = "-users"
  } else {
    query.ordering =
      (sorter.order === "descend" ? "-" : "") + String(sorter.columnKey)
  }
  query.page = 1
}

async function listStats() {
  const offset = (query.page - 1) * query.limit
  const res = await getReactionStats(
    offset,
    query.limit,
    query.problem,
    query.ordering,
  )
  rows.value = res.data.results
  total.value = res.data.total
}

onMounted(listStats)
watch(() => [query.page, query.limit, query.ordering], listStats)
watchDebounced(() => query.problem, listStats, {
  debounce: 500,
  maxWait: 1000,
})
</script>

<style scoped>
.titleWrapper {
  margin-bottom: 16px;
}

.title {
  margin: 0;
}
</style>

<template>
  <n-flex justify="space-between" class="titleWrapper">
    <h2 class="title">AI 学习分析报告</h2>
    <n-input
      v-model:value="query.username"
      clearable
      placeholder="输入用户名筛选"
      style="width: 200px"
    />
  </n-flex>
  <n-data-table striped :columns="columns" :data="reports" />
  <Pagination
    :total="total"
    v-model:limit="query.limit"
    v-model:page="query.page"
  />

  <n-modal v-model:show="showModal" preset="card" title="分析报告详情" style="width: 800px; max-width: 95vw">
    <n-spin :show="loadingDetail">
      <div v-if="detail" class="detail">
        <n-descriptions :column="2" bordered size="small" class="meta">
          <n-descriptions-item label="用户">{{ detail.username }}</n-descriptions-item>
          <n-descriptions-item label="班级">{{ detail.class_name || "-" }}</n-descriptions-item>
          <n-descriptions-item label="时间" :span="2">{{ parseTime(detail.create_time, "YYYY-MM-DD HH:mm:ss") }}</n-descriptions-item>
        </n-descriptions>
        <n-scrollbar style="max-height: 60vh; margin-top: 12px">
          <pre class="analysis">{{ detail.analysis }}</pre>
        </n-scrollbar>
      </div>
    </n-spin>
  </n-modal>
</template>

<script lang="ts" setup>
import Pagination from "shared/components/Pagination.vue"
import { parseTime } from "utils/functions"
import { getAIReportList, getAIReportDetail } from "../api"
import { NButton } from "naive-ui"

interface ReportItem {
  id: number
  create_time: string
  username: string
  class_name: string | null
}

interface ReportDetail extends ReportItem {
  analysis: string
}

const reports = ref<ReportItem[]>([])
const total = ref(0)
const query = reactive({ limit: 10, page: 1, username: "" })

const showModal = ref(false)
const loadingDetail = ref(false)
const detail = ref<ReportDetail | null>(null)

const columns: DataTableColumn<ReportItem>[] = [
  { title: "ID", key: "id", width: 80 },
  { title: "用户名", key: "username", width: 150 },
  { title: "班级", key: "class_name", width: 150, render: (row) => row.class_name || "-" },
  {
    title: "生成时间",
    key: "create_time",
    width: 200,
    render: (row) => parseTime(row.create_time, "YYYY-MM-DD HH:mm:ss"),
  },
  {
    title: "操作",
    key: "action",
    width: 80,
    render: (row) =>
      h(
        NButton,
        { size: "small", type: "primary", onClick: () => openDetail(row.id) },
        () => "查看",
      ),
  },
]

async function listReports() {
  const offset = (query.page - 1) * query.limit
  const res = await getAIReportList(offset, query.limit, query.username)
  reports.value = res.data.results
  total.value = res.data.total
}

async function openDetail(id: number) {
  showModal.value = true
  loadingDetail.value = true
  detail.value = null
  try {
    const res = await getAIReportDetail(id)
    detail.value = res.data
  } finally {
    loadingDetail.value = false
  }
}

onMounted(listReports)
watch(() => [query.page, query.limit], listReports)
watchDebounced(() => query.username, listReports, { debounce: 500, maxWait: 1000 })
</script>

<style scoped>
.titleWrapper {
  margin-bottom: 16px;
  align-items: center;
}
.title {
  margin: 0;
}
.detail .meta {
  margin-bottom: 0;
}
.analysis {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  padding: 8px;
}
</style>

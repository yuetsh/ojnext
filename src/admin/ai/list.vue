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
  <n-alert v-if="pinnedReports.length > 0" type="warning" :show-icon="true" style="margin-bottom: 12px">
    以下 <strong>{{ pinnedReports.length }}</strong> 位用户的 AI 分析报告已被锁定，前台将固定显示该报告：
    <n-flex style="margin-top: 8px" :wrap="true" :size="[8, 6]">
      <n-tag
        v-for="r in pinnedReports"
        :key="r.id"
        type="warning"
        size="small"
        closable
        @close="togglePin(r)"
      >
        {{ r.username }}{{ r.class_name ? `（${r.class_name}）` : "" }}
      </n-tag>
    </n-flex>
  </n-alert>
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
          <MdPreview :model-value="detail.analysis" />
        </n-scrollbar>
      </div>
    </n-spin>
  </n-modal>
</template>

<script lang="ts" setup>
import { MdPreview } from "md-editor-v3"
import "md-editor-v3/lib/preview.css"
import Pagination from "shared/components/Pagination.vue"
import { parseTime } from "utils/functions"
import { getAIReportList, getAIReportDetail, pinAIReport, getPinnedAIReports } from "../api"
import { NButton, NTag } from "naive-ui"

interface ReportItem {
  id: number
  create_time: string
  username: string
  class_name: string | null
  is_pinned: boolean
}

interface ReportDetail extends ReportItem {
  analysis: string
}

const reports = ref<ReportItem[]>([])
const total = ref(0)
const query = reactive({ limit: 10, page: 1, username: "" })
const pinnedReports = ref<ReportItem[]>([])

const showModal = ref(false)
const loadingDetail = ref(false)
const detail = ref<ReportDetail | null>(null)

const columns: DataTableColumn<ReportItem>[] = [
  { title: "ID", key: "id", width: 80 },
  {
    title: "用户名",
    key: "username",
    width: 150,
    render: (row) =>
      h("span", { style: row.is_pinned ? "font-weight:600" : "" }, row.username),
  },
  { title: "班级", key: "class_name", width: 150, render: (row) => row.class_name || "-" },
  {
    title: "生成时间",
    key: "create_time",
    width: 200,
    render: (row) => parseTime(row.create_time, "YYYY-MM-DD HH:mm:ss"),
  },
  {
    title: "PIN 状态",
    key: "is_pinned",
    width: 100,
    render: (row) =>
      row.is_pinned
        ? h(NTag, { type: "warning", size: "small" }, () => "已锁定")
        : null,
  },
  {
    title: "操作",
    key: "action",
    width: 160,
    render: (row) =>
      h("span", { style: "display:flex;gap:8px" }, [
        h(NButton, { size: "small", type: "primary", onClick: () => openDetail(row.id) }, () => "查看"),
        h(
          NButton,
          {
            size: "small",
            type: row.is_pinned ? "error" : "default",
            onClick: () => togglePin(row),
          },
          () => (row.is_pinned ? "取消 PIN" : "PIN"),
        ),
      ]),
  },
]

async function loadPinnedReports() {
  const res = await getPinnedAIReports()
  pinnedReports.value = res.data
}

async function togglePin(row: ReportItem) {
  await pinAIReport(row.id)
  await Promise.all([listReports(), loadPinnedReports()])
}

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

onMounted(() => Promise.all([listReports(), loadPinnedReports()]))
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
</style>

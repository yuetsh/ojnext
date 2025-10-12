<template>
  <div class="flowchart-submission-list">
    <div class="list-header">
      <h2>流程图提交记录</h2>
      <n-space>
        <n-button @click="refreshList" :loading="loading">
          <Icon icon="mdi:refresh" />
          刷新
        </n-button>
      </n-space>
    </div>

    <!-- 筛选器 -->
    <div class="filters">
      <n-space>
        <n-select
          v-model:value="filters.problem_id"
          placeholder="选择题目"
          clearable
          :options="problemOptions"
          style="width: 200px"
        />
        <n-select
          v-model:value="filters.user_id"
          placeholder="选择用户"
          clearable
          :options="userOptions"
          style="width: 200px"
        />
        <n-select
          v-model:value="filters.status"
          placeholder="选择状态"
          clearable
          :options="statusOptions"
          style="width: 150px"
        />
        <n-button type="primary" @click="applyFilters">
          <Icon icon="mdi:filter" />
          筛选
        </n-button>
      </n-space>
    </div>

    <!-- 提交列表 -->
    <div class="submission-list">
      <n-data-table
        :columns="columns"
        :data="submissions"
        :loading="loading"
        :pagination="pagination"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, h } from "vue"
import { useRouter } from "vue-router"
import {
  NButton,
  NSpace,
  NSelect,
  NDataTable,
  NTag,
  useMessage,
} from "naive-ui"
import { Icon } from "@iconify/vue"
import { getFlowchartSubmissions, retryFlowchartSubmission } from "../api"
import {
  FlowchartSubmissionListItem,
  FlowchartSubmissionStatus,
} from "utils/types"

const router = useRouter()

// 响应式数据
const loading = ref(false)
const submissions = ref<FlowchartSubmissionListItem[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

// 筛选器
const filters = reactive({
  problem_id: null as number | null,
  user_id: null as number | null,
  status: null as number | null,
})

// 选项数据
const problemOptions = ref<Array<{ label: string; value: number }>>([])
const userOptions = ref<Array<{ label: string; value: number }>>([])
const statusOptions = [
  { label: "等待评分", value: FlowchartSubmissionStatus.PENDING },
  { label: "评分中", value: FlowchartSubmissionStatus.PROCESSING },
  { label: "评分完成", value: FlowchartSubmissionStatus.COMPLETED },
  { label: "评分失败", value: FlowchartSubmissionStatus.FAILED },
]

const message = useMessage()

// 分页配置
const pagination = computed(() => ({
  page: currentPage.value,
  pageSize: pageSize.value,
  itemCount: total.value,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  showQuickJumper: true,
}))

// 表格列配置
const columns = [
  {
    title: "ID",
    key: "id",
    width: 120,
    render: (row: FlowchartSubmissionListItem) => {
      return row.id.substring(0, 8) + "..."
    },
  },
  {
    title: "用户",
    key: "username",
    width: 120,
  },
  {
    title: "题目",
    key: "problem_title",
    width: 200,
    ellipsis: {
      tooltip: true,
    },
  },
  {
    title: "状态",
    key: "status",
    width: 100,
    render: (row: FlowchartSubmissionListItem) => {
      const statusMap: Record<
        number,
        {
          text: string
          type: "default" | "primary" | "success" | "info" | "warning" | "error"
        }
      > = {
        [FlowchartSubmissionStatus.PENDING]: {
          text: "等待评分",
          type: "warning",
        },
        [FlowchartSubmissionStatus.PROCESSING]: {
          text: "评分中",
          type: "info",
        },
        [FlowchartSubmissionStatus.COMPLETED]: {
          text: "评分完成",
          type: "success",
        },
        [FlowchartSubmissionStatus.FAILED]: { text: "评分失败", type: "error" },
      }
      const status = statusMap[row.status] || { text: "未知", type: "default" }
      return h(NTag, { type: status.type }, { default: () => status.text })
    },
  },
  {
    title: "AI评分",
    key: "ai_score",
    width: 100,
    render: (row: FlowchartSubmissionListItem) => {
      if (row.ai_score !== null && row.ai_score !== undefined) {
        return `${row.ai_score.toFixed(1)}分`
      }
      return "-"
    },
  },
  {
    title: "等级",
    key: "ai_grade",
    width: 80,
    render: (row: FlowchartSubmissionListItem) => {
      if (row.ai_grade) {
        const gradeColors: Record<
          string,
          "default" | "primary" | "success" | "info" | "warning" | "error"
        > = {
          S: "success",
          A: "info",
          B: "warning",
          C: "error",
        }
        return h(
          NTag,
          { type: gradeColors[row.ai_grade] || "default" },
          { default: () => row.ai_grade },
        )
      }
      return "-"
    },
  },
  {
    title: "处理时间",
    key: "processing_time",
    width: 100,
    render: (row: FlowchartSubmissionListItem) => {
      if (row.processing_time) {
        return `${row.processing_time.toFixed(2)}s`
      }
      return "-"
    },
  },
  {
    title: "提交时间",
    key: "create_time",
    width: 160,
    render: (row: FlowchartSubmissionListItem) => {
      return new Date(row.create_time).toLocaleString()
    },
  },
  {
    title: "操作",
    key: "actions",
    width: 120,
    render: (row: FlowchartSubmissionListItem) => {
      return h(NSpace, null, {
        default: () => [
          h(
            NButton,
            {
              size: "small",
              type: "primary",
              onClick: () => viewSubmission(row),
            },
            { default: () => "查看" },
          ),
          row.status === FlowchartSubmissionStatus.FAILED &&
            h(
              NButton,
              {
                size: "small",
                type: "warning",
                onClick: () => retrySubmission(row),
              },
              { default: () => "重试" },
            ),
        ],
      })
    },
  },
]

// 方法
const loadSubmissions = async () => {
  loading.value = true
  try {
    const params: any = {
      offset: (currentPage.value - 1) * pageSize.value,
      limit: pageSize.value,
    }

    if (filters.problem_id !== null) {
      params.problem_id = filters.problem_id
    }
    if (filters.user_id !== null) {
      params.user_id = filters.user_id
    }
    if (filters.status !== null) {
      params.status = filters.status
    }

    const response = await getFlowchartSubmissions(params)
    submissions.value = response.data.results
    total.value = response.data.total
  } catch (error: any) {
    console.error("加载提交列表失败:", error)
    message.error("加载提交列表失败")
  } finally {
    loading.value = false
  }
}

const refreshList = () => {
  currentPage.value = 1
  loadSubmissions()
}

const applyFilters = () => {
  currentPage.value = 1
  loadSubmissions()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadSubmissions()
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadSubmissions()
}

const viewSubmission = (submission: FlowchartSubmissionListItem) => {
  router.push({
    name: "flowchart-detail",
    params: { id: submission.id },
  })
}

const retrySubmission = async (submission: FlowchartSubmissionListItem) => {
  try {
    await retryFlowchartSubmission(submission.id)
    message.success("重试请求已发送")
    loadSubmissions()
  } catch (error: any) {
    console.error("重试失败:", error)
    message.error("重试失败")
  }
}

// 生命周期
onMounted(() => {
  loadSubmissions()
})
</script>

<style scoped>
.flowchart-submission-list {
  padding: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.list-header h2 {
  margin: 0;
  color: #333;
}

.filters {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 6px;
}

.submission-list {
  background: white;
  border-radius: 6px;
  overflow: hidden;
}
</style>

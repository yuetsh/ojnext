<script setup lang="ts">
import { h, computed, ref, onMounted, watch } from "vue"
import { watchDebounced } from "@vueuse/core"
import { parseTime } from "utils/functions"
import { ProblemSetProgress } from "utils/types"
import { getProblemSetUserProgress } from "../../api"
import { NTag } from "naive-ui"
import { usePagination } from "shared/composables/pagination"
import Pagination from "shared/components/Pagination.vue"

const route = useRoute()
const problemSetId = computed(() => Number(route.params.problemSetId))
const progress = ref<ProblemSetProgress[]>([])
const loading = ref(false)
const total = ref(0)
const statistics = ref<{
  total: number
  completed: number
  avg_progress: number
} | null>(null)
const classFilter = ref<string>("")
const completionFilter = ref<"" | "completed" | "in_progress" | "not_started">("")
const allProblems = ref<Array<{ id: number; _id: string; title: string }>>([])

// 完成度筛选选项
const completionOptions = [
  { label: "全部", value: "" },
  { label: "未开始", value: "not_started"},
  { label: "已完成", value: "completed" },
  { label: "进行中", value: "in_progress" },
]

// 使用分页 composable
const { query } = usePagination({}, { defaultLimit: 10 })

// 加载用户进度数据
async function loadUserProgress() {
  loading.value = true
  const offset = (query.page - 1) * query.limit
  const params: {
    limit?: number
    offset?: number
    class_name?: string
    completion_status?: "" | "completed" | "in_progress" | "not_started"
  } = {
    limit: query.limit,
    offset,
  }
  if (classFilter.value.trim()) {
    params.class_name = classFilter.value.trim()
  }
  if (completionFilter.value) {
    params.completion_status = completionFilter.value
  }
  const res = await getProblemSetUserProgress(problemSetId.value, params)

  progress.value = res.data.results
  total.value = res.data.total
  // 使用后端返回的统计数据（基于所有数据）
  if (res.data.statistics) {
    statistics.value = res.data.statistics
  }
  // 保存所有题目信息
  if (res.data.problems) {
    allProblems.value = res.data.problems
  }
  loading.value = false
}

// 监听分页参数变化
watch([() => query.page, () => query.limit], loadUserProgress)
// 监听班级过滤变化（防抖）
watchDebounced(
  classFilter,
  () => {
    query.page = 1 // 重置到第一页
    loadUserProgress()
  },
  { debounce: 500 },
)
// 监听完成度筛选变化
watch(completionFilter, () => {
  query.page = 1 // 重置到第一页
  loadUserProgress()
})

// 使用后端返回的统计数据
const stats = computed(() => {
  if (statistics.value) {
    return {
      total: statistics.value.total,
      completed: statistics.value.completed,
      avgProgress: Math.round(statistics.value.avg_progress),
    }
  }
  // 如果后端还没有返回统计数据，使用默认值
  return {
    total: total.value,
    completed: 0,
    avgProgress: 0,
  }
})

onMounted(loadUserProgress)

// 定义表格列
const progressColumns = [
  {
    title: "排名",
    key: "rank",
    width: 80,
    render: (row: ProblemSetProgress, index: number) => {
      // 计算全局排名：当前页偏移 + 当前行索引 + 1
      const globalRank = (query.page - 1) * query.limit + index + 1
      return globalRank
    },
  },
  {
    title: "用户",
    key: "user.username",
    width: 120,
    render: (row: ProblemSetProgress) => row.user.username,
  },
  {
    title: "加入时间",
    key: "join_time",
    width: 180,
    render: (row: ProblemSetProgress) =>
      parseTime(row.join_time, "YYYY-MM-DD HH:mm:ss"),
  },
  {
    title: "已完成数量",
    key: "completed_problems_count",
    width: 100,
  },
  {
    title: "已/未完成题目",
    key: "completed_problems",
    width: 300,
    render: (row: ProblemSetProgress) => {
      if (row.progress_percentage === 100) {
        return "全部题目已完成"
      }
      if (row.progress_percentage > 50 && row.progress_percentage < 100) {
        const completedProblemIds = new Set(
          row.completed_problems.map((p: any) => p.id),
        )
        const incompleteProblems = allProblems.value.filter(
          (p) => !completedProblemIds.has(p.id),
        )
        return h("div", { style: "max-height: 120px; overflow-y: auto" }, [
          h(
            "div",
            { style: "display: flex; flex-wrap: wrap; gap: 4px" },
            incompleteProblems.map((problem) =>
              h(
                NTag,
                { type: "warning", size: "small", style: "margin: 2px" },
                `${problem._id}: ${problem.title}`,
              ),
            ),
          ),
        ])
      }
      return h("div", { style: "max-height: 120px; overflow-y: auto" }, [
        h(
          "div",
          { style: "display: flex; flex-wrap: wrap; gap: 4px" },
          row.completed_problems.map((problem: any) =>
            h(
              NTag,
              {
                type: "success",
                size: "small",
                style: "margin: 2px",
              },
              `${problem._id}: ${problem.title}`,
            ),
          ),
        ),
      ])
    },
  },
  {
    title: "进度",
    key: "progress_percentage",
    width: 120,
    render: (row: ProblemSetProgress) => {
      return `${row.progress_percentage.toFixed(0)}%`
    },
  },
  {
    title: "状态",
    key: "is_completed",
    width: 100,
    render: (row: ProblemSetProgress) => {
      if (row.is_completed) {
        return h(NTag, { type: "success" }, "已完成")
      } else {
        return h(NTag, { type: "warning" }, "进行中")
      }
    },
  },
]
</script>

<template>
  <div>
    <!-- 过滤条件 -->
    <n-form label-placement="left" inline>
      <n-form-item label="班级">
        <n-input
          v-model:value="classFilter"
          placeholder="输入班级名称"
          style="width: 200px"
          clearable
        />
      </n-form-item>

      <n-form-item label="完成度：">
        <n-select
          v-model:value="completionFilter"
          :options="completionOptions"
          placeholder="完成度"
          style="width: 160px"
          clearable
        />
      </n-form-item>
    </n-form>

    <!-- 统计信息卡片 -->
    <n-grid :cols="3" :x-gap="16" style="margin-bottom: 16px">
      <n-grid-item>
        <n-card size="small">
          <n-statistic label="总参与人数" :value="stats.total" />
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card size="small">
          <n-statistic label="已完成人数" :value="stats.completed" />
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card size="small">
          <n-statistic
            label="平均进度"
            :value="stats.avgProgress.toFixed(0) + '%'"
          />
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-data-table
      :loading="loading"
      :columns="progressColumns"
      :data="progress"
      :pagination="false"
      :bordered="false"
      :single-line="false"
    />

    <Pagination
      :total="total"
      :limit="query.limit"
      :page="query.page"
      @update:limit="(limit: number) => (query.limit = limit)"
      @update:page="(page: number) => (query.page = page)"
    />
  </div>
</template>

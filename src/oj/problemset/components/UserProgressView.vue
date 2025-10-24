<script setup lang="ts">
import { h, computed, ref, onMounted, watch } from "vue"
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

// 使用分页 composable
const { query } = usePagination({}, { defaultLimit: 10 })

// 加载用户进度数据
async function loadUserProgress() {
  loading.value = true
  const offset = (query.page - 1) * query.limit
  const res = await getProblemSetUserProgress(problemSetId.value, {
    limit: query.limit,
    offset,
  })

  progress.value = res.data.results
  total.value = res.data.total
  loading.value = false
}

// 监听分页参数变化
watch([() => query.page, () => query.limit], loadUserProgress)

// 计算统计数据
const stats = computed(() => {
  const completed = progress.value.filter((p) => p.is_completed).length
  const avgProgress =
    progress.value.length > 0
      ? progress.value.reduce((sum, p) => sum + p.progress_percentage, 0) /
        progress.value.length
      : 0

  return {
    total: total.value,
    completed,
    avgProgress: Math.round(avgProgress),
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
    title: "已完成题目",
    key: "completed_problems",
    width: 300,
    render: (row: ProblemSetProgress) => {
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

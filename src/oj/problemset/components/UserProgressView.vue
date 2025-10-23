<script setup lang="ts">
import { h, computed, ref, onMounted } from "vue"
import { Icon } from "@iconify/vue"
import { parseTime } from "utils/functions"
import { ProblemSetProgress } from "utils/types"
import { getProblemSetUserProgress } from "../../api"
import { NP, NProgress, NTag, useMessage } from "naive-ui"

const message = useMessage()

const route = useRoute()
const problemSetId = computed(() => Number(route.params.problemSetId))
const progress = ref<ProblemSetProgress[]>([])
const loading = ref(false)

// 加载用户进度数据
async function loadUserProgress() {
  loading.value = true
  try {
    const res = await getProblemSetUserProgress(problemSetId.value)
    progress.value = res.data
  } catch (err: any) {
    message.error("加载用户进度失败：" + (err.data || "未知错误"))
  } finally {
    loading.value = false
  }
}

// 计算统计数据
const stats = computed(() => {
  const total = progress.value.length
  const completed = progress.value.filter((p) => p.is_completed).length
  const avgProgress =
    total > 0
      ? progress.value.reduce((sum, p) => sum + p.progress_percentage, 0) /
        total
      : 0

  return {
    total,
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
    render: (row: ProblemSetProgress, index: number) => index + 1,
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
    <n-flex justify="space-between" align="center" style="margin-bottom: 16px">
      <n-h3 style="margin: 0">用户进度</n-h3>
      <n-text depth="3">共 {{ stats.total }} 人参与</n-text>
    </n-flex>

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
          <n-statistic label="平均进度" :value="stats.avgProgress.toFixed(0) + '%'" />
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-data-table
      :columns="progressColumns"
      :data="progress"
      :loading="loading"
      :pagination="false"
      :bordered="false"
      :single-line="false"
    />
  </div>
</template>

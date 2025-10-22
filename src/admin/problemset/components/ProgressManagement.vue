<script setup lang="ts">
import { h } from "vue"
import { NDataTable, NButton, NFlex } from "naive-ui"
import { parseTime } from "utils/functions"
import { ProblemSetProgress } from "utils/types"

interface Props {
  progress: ProblemSetProgress[]
}

interface Emits {
  (e: "remove-user", userId: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// 定义表格列
const progressColumns = [
  { title: "用户", key: "user.username", width: 120 },
  {
    title: "加入时间",
    key: "join_time",
    width: 180,
    render: (row: ProblemSetProgress) =>
      parseTime(row.join_time, "YYYY-MM-DD HH:mm:ss"),
  },
  { title: "已完成", key: "completed_problems_count", width: 100 },
  { title: "总题目", key: "total_problems_count", width: 100 },
  {
    title: "进度",
    key: "progress_percentage",
    width: 100,
    render: (row: ProblemSetProgress) => `${row.progress_percentage}%`,
  },
  {
    title: "是否完成",
    key: "is_completed",
    width: 100,
    render: (row: ProblemSetProgress) => (row.is_completed ? "是" : "否"),
  },
  {
    title: "操作",
    key: "actions",
    width: 120,
    render: (row: ProblemSetProgress) =>
      h(
        NButton,
        {
          size: "small",
          type: "error",
          secondary: true,
          onClick: () => emit("remove-user", row.user.id),
        },
        { default: () => "移除" },
      ),
  },
]
</script>

<template>
  <div>
    <n-flex
      justify="space-between"
      align="center"
      style="margin-bottom: 16px"
    >
      <h3>用户进度</h3>
    </n-flex>
    <n-data-table :columns="progressColumns" :data="progress" />
  </div>
</template>

<script setup lang="ts">
import { getStuckProblems } from "admin/api"

interface StuckProblem {
  problem_id: string
  problem_title: string
  total: number
  failed: number
  failed_users: number
  ac_rate: number
}

const loading = ref(true)
const data = ref<StuckProblem[]>([])

const columns: DataTableColumn<StuckProblem>[] = [
  { title: "题目 ID", key: "problem_id", width: 100 },
  { title: "题目名称", key: "problem_title", minWidth: 200 },
  { title: "总提交", key: "total", width: 100, sorter: "default" },
  { title: "失败次数", key: "failed", width: 100, sorter: "default" },
  {
    title: "卡住学生数",
    key: "failed_users",
    width: 120,
    sorter: "default",
    defaultSortOrder: "descend",
  },
  {
    title: "AC 率",
    key: "ac_rate",
    width: 100,
    sorter: "default",
    render: (row) => `${row.ac_rate}%`,
  },
]

onMounted(async () => {
  try {
    const res = await getStuckProblems()
    data.value = res.data
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <h2 style="margin-top: 0">学生卡点分析</h2>
  <n-data-table
    :loading="loading"
    :columns="columns"
    :data="data"
    striped
    :pagination="{ pageSize: 20 }"
  />
</template>

<script lang="ts" setup>
const columns: DataTableColumn[] = [
  { title: "AC 时间", key: "ac_time" },
  { title: "问题 ID", key: "problem_display_id" },
  { title: "一血", key: "is_first_ac" },
  { title: "用户名", key: "username" },
  { title: "状态", key: "status" },
  { title: "选项", key: "actions" },
]
</script>
<template>
  <n-data-table :columns="columns"></n-data-table>
</template>

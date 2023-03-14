<script lang="ts" setup>
import { deleteProblem } from "~/admin/api"

interface Props {
  problemID: number
}
const props = defineProps<Props>()
const emit = defineEmits(["deleted"])
const message = useMessage()

async function handleDeleteProblem(problemID: number) {
  await deleteProblem(problemID)
  message.success("删除成功")
  emit("deleted")
}
</script>
<template>
  <n-popconfirm @positive-click="() => handleDeleteProblem(props.problemID)">
    <template #trigger>
      <n-button tertiary size="small" type="error">删除</n-button>
    </template>
    确定删除这道题目吗？相关的提交也会被相应删除哦 😯
  </n-popconfirm>
</template>

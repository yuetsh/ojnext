<script lang="ts" setup>
import { deleteProblem } from "~/admin/api"

interface Props {
  problemID: number
}
const props = defineProps<Props>()
const emit = defineEmits(["deleted"])

const router = useRouter()
const message = useMessage()

async function handleDeleteProblem(problemID: number) {
  await deleteProblem(problemID)
  message.success("删除成功")
  emit("deleted")
}

function download() {
  console.log(props.problemID)
}

function goEdit() {
  router.push({
    name: "problem edit",
    params: { problemID: props.problemID },
  })
}
</script>
<template>
  <n-space align="center">
    <n-button size="small" secondary type="primary" @click="goEdit">
      编辑
    </n-button>
    <n-popconfirm @positive-click="() => handleDeleteProblem(props.problemID)">
      <template #trigger>
        <n-button secondary size="small" type="error">删除</n-button>
      </template>
      确定删除这道题目吗？相关的提交也会被相应删除哦 😯
    </n-popconfirm>
    <n-tooltip>
      <template #trigger>
        <n-button size="small" secondary @click="download">下载</n-button>
      </template>
      下载测试用例
    </n-tooltip>
  </n-space>
</template>

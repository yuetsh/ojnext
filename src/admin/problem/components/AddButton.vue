<script setup lang="ts">
import { addProblemForContest } from "admin/api"

interface Props {
  problemID: number
  contestID: string
}
const props = defineProps<Props>()
const emit = defineEmits(["added"])

const message = useMessage()

const displayID = ref("")

async function addProblem() {
  if (!displayID.value) return
  try {
    await addProblemForContest(
      props.contestID,
      props.problemID,
      displayID.value,
    )
    emit("added")
  } catch (err: any) {
    if (err.data === "Duplicate display id in this contest") {
      message.error("显示编号重复了，请重新写一个")
    } else if (err.data === "Contest has ended") {
      message.error("这场比赛已经结束了，不能添加题目")
    } else {
      message.error(err.data)
    }
  }
}
</script>
<template>
  <n-popconfirm :show-icon="false" @positive-click="addProblem">
    <template #trigger>
      <n-button secondary size="small" type="primary">添加</n-button>
    </template>
    <n-flex vertical>
      <span>请输入在这场比赛中的显示编号</span>
      <n-input autofocus v-model:value="displayID" />
    </n-flex>
  </n-popconfirm>
</template>
<style scoped></style>

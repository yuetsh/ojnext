<script lang="ts" setup>
import { Contest } from "~/utils/types"

interface Props {
  contest: Contest
}
const props = defineProps<Props>()
const router = useRouter()

function goEdit() {
  router.push({
    name: "admin contest edit",
    params: { contestID: props.contest.id },
  })
}

function goEditProblems() {
  router.push({
    name: "admin contest problem list",
    params: { contestID: props.contest.id },
  })
}
</script>
<template>
  <n-space>
    <n-button size="small" type="primary" secondary @click="goEditProblems">
      题目
    </n-button>
    <n-button size="small" type="info" secondary @click="goEdit">
      编辑
    </n-button>
  </n-space>
</template>
<style scoped></style>

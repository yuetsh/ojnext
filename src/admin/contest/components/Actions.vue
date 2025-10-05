<script lang="ts" setup>
import { Contest } from "utils/types"

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

function goACMHelper() {
  router.push({
    name: "admin contest helper",
    params: { contestID: props.contest.id },
  })
}

const isACM = computed(() => props.contest.rule_type === "ACM")
</script>
<template>
  <n-flex>
    <n-button size="small" type="primary" secondary @click="goEditProblems">
      题目
    </n-button>
    <n-button
      v-if="isACM"
      size="small"
      type="warning"
      secondary
      @click="goACMHelper"
    >
      审核
    </n-button>
    <n-button size="small" type="info" secondary @click="goEdit">
      编辑
    </n-button>
  </n-flex>
</template>
<style scoped></style>

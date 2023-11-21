<script setup lang="ts">
import { JUDGE_STATUS } from "utils/constants"
import { SUBMISSION_RESULT } from "utils/types"

interface Props {
  result: SUBMISSION_RESULT
}
defineProps<Props>()
</script>

<template>
  <n-tag :type="JUDGE_STATUS[result]['type']">
    {{ JUDGE_STATUS[result]["name"] }}
  </n-tag>
</template>

<style scoped></style>

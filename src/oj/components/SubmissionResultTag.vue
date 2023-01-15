<script setup lang="ts">
import { JUDGE_STATUS } from "../../utils/constants"
import { SUBMISSION_RESULT } from "../../utils/types"

interface Props {
  result: SUBMISSION_RESULT
}
defineProps<Props>()
</script>

<template>
  <el-tag :type="JUDGE_STATUS[result]['type']" disable-transitions>
    {{ JUDGE_STATUS[result]["name"] }}
  </el-tag>
</template>

<style scoped></style>

<script lang="ts" setup>
import { ProblemFiltered } from "utils/types"
import { Icon } from "@iconify/vue"

defineProps<{
  problem: ProblemFiltered
}>()
</script>
<template>
  <n-flex align="center">
    <span>{{ problem.title }}</span>
    <Icon
      v-if="problem.allow_flowchart"
      icon="streamline-freehand-color:programming-flowchart"
    />
  </n-flex>
</template>

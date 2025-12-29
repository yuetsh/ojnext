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
      width="18"
      icon="vscode-icons:file-type-drawio"
    />
  </n-flex>
</template>

<script setup lang="ts">
import { Contest } from "utils/types"
import { ContestType } from "utils/constants"
import { Icon } from "@iconify/vue"

defineProps<{ contest: Contest }>()
</script>
<template>
  <n-flex>
    <Icon
      v-if="contest.contest_type === ContestType.private"
      :height="20"
      :width="20"
      icon="openmoji:locked"
    ></Icon>
    <span>{{ contest.title }}</span>
  </n-flex>
</template>
<style scoped></style>

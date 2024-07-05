<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { ContestType } from "utils/constants"
import { Contest } from "utils/types"

defineProps<{ contest: Contest }>()
</script>
<template>
  <n-flex>
    <Icon
      v-if="contest.contest_type === ContestType.private"
      :height="24"
      icon="streamline-emojis:locked-with-key"
    ></Icon>
    <span>{{ contest.title }}</span>
  </n-flex>
</template>
<style scoped></style>

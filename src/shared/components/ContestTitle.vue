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
      :height="24"
      :width="24"
      icon="streamline-emojis:locked-with-key"
    ></Icon>
    <span>{{ contest.title }}</span>
  </n-flex>
</template>
<style scoped></style>

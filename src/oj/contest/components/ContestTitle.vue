<script setup lang="ts">
import { Contest } from "~/utils/types"
import { ContestType } from "~/utils/constants"

defineProps<{ contest: Contest }>()
</script>
<template>
  <n-space>
    <span>{{ contest.title }}</span>
    <n-icon
      class="lockIcon"
      v-if="contest.contest_type === ContestType.private"
    >
      <i-ep-lock />
    </n-icon>
  </n-space>
</template>
<style scoped>
.lockIcon {
  transform: translateY(2px);
}
</style>

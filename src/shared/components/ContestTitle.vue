<script setup lang="ts">
import { Contest } from "utils/types"
import { ContestType } from "utils/constants"
import Lock from "~/shared/icons/Lock.vue"

defineProps<{ contest: Contest }>()
</script>
<template>
  <n-space>
    <span>{{ contest.title }}</span>
    <n-icon
      size="large"
      class="lockIcon"
      v-if="contest.contest_type === ContestType.private"
    >
      <Lock />
    </n-icon>
  </n-space>
</template>
<style scoped>
.lockIcon {
  transform: translateY(2px);
}
</style>

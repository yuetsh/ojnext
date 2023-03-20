<script setup lang="ts">
import { Contest } from "~/utils/types"
import { ContestType } from "~/utils/constants"

interface Props {
  contest: Contest
  size?: "small"
}

const props = defineProps<Props>()

const isPrivate = computed(
  () => props.contest.contest_type === ContestType.private
)
</script>

<template>
  <n-tag :type="isPrivate ? 'error' : 'info'" :size="props.size">
    {{ isPrivate ? "需要密码" : "公开" }}
  </n-tag>
</template>

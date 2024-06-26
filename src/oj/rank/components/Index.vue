<script lang="ts" setup>
import { Icon } from "@iconify/vue"

interface Props {
  page: number
  limit: number
  index: number
}

const props = defineProps<Props>()
const index = computed(() => props.index + (props.page - 1) * props.limit + 1)
const tooltip = computed(() => {
  if (index.value === 1) return "🏅 金牌"
  if (index.value === 2) return "🥈 银牌"
  if (index.value === 3) return "🥉 铜牌"
  return ""
})
</script>
<template>
  <span v-if="index > 3">{{ index }}</span>
  <n-tooltip v-else>
    <template #trigger>
      <n-icon :size="20">
        <Icon v-if="index === 1" icon="openmoji:1st-place-medal"></Icon>
        <Icon v-if="index === 2" icon="openmoji:2nd-place-medal"></Icon>
        <Icon v-if="index === 3" icon="openmoji:3rd-place-medal"></Icon>
      </n-icon>
    </template>
    {{ tooltip }}
  </n-tooltip>
</template>

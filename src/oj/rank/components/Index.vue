<script lang="ts" setup>
interface Props {
  page: number
  limit: number
  index: number
}

const props = defineProps<Props>()
const index = computed(() => props.index + (props.page - 1) * props.limit + 1)
const color = computed(() => {
  if (index.value === 1) return "#FFD700"
  if (index.value === 2) return "#C0C0C0"
  if (index.value === 3) return "rgb(191,173,111)"
  return ""
})
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
      <n-icon class="icon" size="20">
        <i-ep-medal :color="color" />
      </n-icon>
    </template>
    {{ tooltip }}
  </n-tooltip>
</template>
<style scoped>
.icon {
  transform: translateY(4px);
}
</style>

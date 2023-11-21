<script lang="ts" setup>
import Medal1 from "~/shared/icons/Medal1.vue"
import Medal2 from "~/shared/icons/Medal2.vue"
import Medal3 from "~/shared/icons/Medal3.vue"

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
        <Medal1 v-if="index === 1" />
        <Medal2 v-if="index === 2" />
        <Medal3 v-if="index === 3" />
      </n-icon>
    </template>
    {{ tooltip }}
  </n-tooltip>
</template>

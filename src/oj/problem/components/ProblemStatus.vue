<script setup lang="ts">
import { useThemeVars } from "naive-ui"
import Select from "~/shared/icons/Select.vue"
import SemiSelect from "~/shared/icons/SemiSelect.vue"

const theme = useThemeVars()
const props = defineProps<{
  status: "not_test" | "passed" | "failed"
}>()

const showIcon = computed(() => props.status !== "not_test")
const color = computed(() => {
  if (props.status === "passed") return theme.value.successColor
  if (props.status === "failed") return theme.value.errorColor
})

const Icon = computed(() => {
  if (props.status === "passed") return Select
  if (props.status === "failed") return SemiSelect
  return {}
})
</script>

<template>
  <n-icon v-if="showIcon" :color="color">
    <component :is="Icon"></component>
  </n-icon>
</template>

<style scoped></style>

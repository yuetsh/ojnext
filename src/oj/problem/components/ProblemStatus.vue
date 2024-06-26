<script setup lang="ts">
import { useThemeVars } from "naive-ui"
import { Icon } from "@iconify/vue"

const theme = useThemeVars()
const props = defineProps<{
  status: "not_test" | "passed" | "failed"
}>()

const showIcon = computed(() => props.status !== "not_test")
const color = computed(() => {
  if (props.status === "passed") return theme.value.successColor
  if (props.status === "failed") return theme.value.errorColor
})
</script>

<template>
  <n-icon v-if="showIcon" :color="color">
    <Icon icon="ep:select" v-if="status === 'passed'"></Icon>
    <Icon icon="ep:semi-select" v-if="status === 'failed'"></Icon>
  </n-icon>
</template>

<style scoped></style>

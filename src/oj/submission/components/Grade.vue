<template>
  <n-text :type="gradeType(grade)">
    <span>{{ score }}</span>
    <span>({{ grade }})</span>
  </n-text>
</template>
<script setup lang="ts">
import { Grade } from "utils/types"
defineProps<{
  score: number
  grade: Grade
}>()

function gradeType(grade: Grade) {
  return (
    {
      S: "success",
      A: "info",
      B: "warning",
      C: "error",
    } as const
  )[grade]
}
</script>
<style scoped></style>

<script setup lang="ts">
import { Exercise } from "utils/types"

const ExerciseMcq = defineAsyncComponent(() => import("./ExerciseMcq.vue"))
const ExerciseSort = defineAsyncComponent(() => import("./ExerciseSort.vue"))

defineProps<{ exercise: Exercise; lang?: string }>()
</script>

<template>
  <ExerciseMcq v-if="exercise.type === 'mcq'" :exercise="exercise" />
  <ExerciseSort v-else-if="exercise.type === 'sort'" :exercise="exercise" :lang="lang" />
</template>

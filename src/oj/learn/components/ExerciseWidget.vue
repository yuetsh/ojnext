<script setup lang="ts">
import { Exercise } from "utils/types"

const ExerciseMcq = defineAsyncComponent(() => import("./ExerciseMcq.vue"))
const ExerciseSort = defineAsyncComponent(() => import("./ExerciseSort.vue"))
const ExerciseFill = defineAsyncComponent(() => import("./ExerciseFill.vue"))

defineProps<{ exercise: Exercise; lang?: string }>()
</script>

<template>
  <ExerciseMcq v-if="exercise.type === 'mcq'" :exercise="exercise" />
  <ExerciseSort
    v-else-if="exercise.type === 'sort'"
    :exercise="exercise"
    :lang="lang"
  />
  <ExerciseFill
    v-else-if="exercise.type === 'fill'"
    :exercise="exercise"
    :lang="lang"
  />
</template>

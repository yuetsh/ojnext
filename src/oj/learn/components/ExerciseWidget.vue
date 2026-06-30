<script setup lang="ts">
import { Exercise } from "utils/types"

const ExerciseMcq = defineAsyncComponent(() => import("./ExerciseMcq.vue"))
const ExerciseSort = defineAsyncComponent(() => import("./ExerciseSort.vue"))
const ExerciseFill = defineAsyncComponent(() => import("./ExerciseFill.vue"))
const ExerciseMatch = defineAsyncComponent(() => import("./ExerciseMatch.vue"))
const ExercisePredict = defineAsyncComponent(
  () => import("./ExercisePredict.vue"),
)
const ExerciseDebug = defineAsyncComponent(() => import("./ExerciseDebug.vue"))
const ExerciseGroup = defineAsyncComponent(() => import("./ExerciseGroup.vue"))

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
  <ExerciseMatch v-else-if="exercise.type === 'match'" :exercise="exercise" />
  <ExercisePredict
    v-else-if="exercise.type === 'predict'"
    :exercise="exercise"
    :lang="lang"
  />
  <ExerciseDebug
    v-else-if="exercise.type === 'debug'"
    :exercise="exercise"
    :lang="lang"
  />
  <ExerciseGroup v-else-if="exercise.type === 'group'" :exercise="exercise" />
</template>

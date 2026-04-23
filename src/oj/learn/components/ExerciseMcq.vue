<script setup lang="ts">
import { Exercise, ExerciseMcqData } from "utils/types"

const props = defineProps<{ exercise: Exercise }>()
const data = computed(() => props.exercise.data as ExerciseMcqData)

const selected = ref<number | null>(null)
const submitted = ref(false)

function select(idx: number) {
  if (!submitted.value) selected.value = idx
}

function submit() {
  if (selected.value === null) return
  submitted.value = true
}

function reset() {
  selected.value = null
  submitted.value = false
}

function optionType(idx: number): "default" | "success" | "error" {
  if (!submitted.value) return "default"
  if (idx === data.value.answer) return "success"
  if (idx === selected.value) return "error"
  return "default"
}
</script>

<template>
  <n-card size="small" style="margin: 16px 0; border: 1.5px solid var(--n-border-color)">
    <template #header>
      <n-space align="center" :size="8">
        <n-tag type="success" size="small" :bordered="false">练一练 · 选择题</n-tag>
      </n-space>
    </template>

    <p style="font-weight: 500; margin-bottom: 12px">{{ data.question }}</p>

    <n-space vertical :size="8">
      <n-button
        v-for="(opt, idx) in data.options"
        :key="idx"
        :type="optionType(idx)"
        :secondary="optionType(idx) !== 'default'"
        :tertiary="optionType(idx) === 'default'"
        :style="{ justifyContent: 'flex-start', width: '100%', textAlign: 'left' }"
        @click="select(idx)"
      >
        <template #icon>
          <span style="font-weight: 700">{{ String.fromCharCode(65 + idx) }}</span>
        </template>
        {{ opt }}
      </n-button>
    </n-space>

    <n-alert
      v-if="submitted"
      :type="selected === data.answer ? 'success' : 'error'"
      :title="selected === data.answer ? '正确！' : '不对，请看正确答案（绿色）'"
      style="margin-top: 12px"
    />

    <n-space style="margin-top: 12px" :size="8">
      <n-button
        type="primary"
        size="small"
        :disabled="selected === null || submitted"
        @click="submit"
      >
        提交
      </n-button>
      <n-button size="small" @click="reset">重置</n-button>
    </n-space>
  </n-card>
</template>

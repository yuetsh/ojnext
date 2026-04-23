<script setup lang="ts">
import { Exercise, ExerciseMcqData } from "utils/types"

const props = defineProps<{ exercise: Exercise }>()
const data = computed(() => props.exercise.data as ExerciseMcqData)

const selected = ref<number | null>(null)
const correct = ref(false)
const wrong = ref(false)

function select(idx: number) {
  if (correct.value) return
  selected.value = idx
  wrong.value = false
}

function submit() {
  if (selected.value === null || correct.value) return
  if (selected.value === data.value.answer) {
    correct.value = true
    wrong.value = false
  } else {
    wrong.value = true
    selected.value = null
  }
}

function reset() {
  selected.value = null
  correct.value = false
  wrong.value = false
}

function optionType(idx: number): "default" | "primary" | "success" {
  if (correct.value && idx === data.value.answer) return "success"
  if (idx === selected.value) return "primary"
  return "default"
}
</script>

<template>
  <n-card
    size="small"
    style="margin: 16px 0; border: 1.5px solid var(--n-border-color)"
  >
    <template #header>
      <n-space align="center" :size="8">
        <n-tag type="success" size="small" :bordered="false"
          >练一练 · 选择题</n-tag
        >
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
        :strong="idx === selected"
        :style="{
          justifyContent: 'flex-start',
          width: '100%',
          textAlign: 'left',
        }"
        @click="select(idx)"
      >
        <template #icon>
          <span style="font-weight: 700">{{
            String.fromCharCode(65 + idx)
          }}</span>
        </template>
        {{ opt }}
      </n-button>
    </n-space>

    <n-alert
      v-if="correct || wrong"
      :type="correct ? 'success' : 'error'"
      :title="correct ? '正确！' : '选择有误，请重试'"
      style="margin-top: 12px"
    />

    <n-space style="margin-top: 12px" :size="8">
      <n-button
        type="primary"
        size="small"
        :disabled="selected === null || correct"
        @click="submit"
      >
        提交
      </n-button>
      <n-button size="small" @click="reset">重置</n-button>
    </n-space>
  </n-card>
</template>

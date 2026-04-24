<script setup lang="ts">
import { Exercise, ExerciseMcqData } from "utils/types"

const props = defineProps<{ exercise: Exercise }>()
const data = computed(() => props.exercise.data as ExerciseMcqData)

const selected = ref<Set<number>>(new Set())
const correct = ref(false)
const wrong = ref(false)
const partial = ref(false)

function select(idx: number) {
  if (correct.value) return
  const s = new Set(selected.value)
  if (s.has(idx)) s.delete(idx)
  else s.add(idx)
  selected.value = s
  wrong.value = false
  partial.value = false
}

function submit() {
  if (selected.value.size === 0 || correct.value) return
  const answer = new Set(data.value.answer)
  const sel = selected.value
  const isEqual =
    sel.size === answer.size && [...sel].every((v) => answer.has(v))
  if (isEqual) {
    correct.value = true
    wrong.value = false
    partial.value = false
  } else {
    const hasIntersection = [...sel].some((v) => answer.has(v))
    if (hasIntersection) {
      partial.value = true
      wrong.value = false
    } else {
      wrong.value = true
      partial.value = false
    }
  }
}

function reset() {
  selected.value = new Set()
  correct.value = false
  wrong.value = false
  partial.value = false
}

function optionType(idx: number): "default" | "primary" | "success" {
  if (correct.value && data.value.answer.includes(idx)) return "success"
  if (selected.value.has(idx)) return "primary"
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
          >练一练 · 多选题</n-tag
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
        :strong="selected.has(idx)"
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
      v-if="correct || wrong || partial"
      :type="correct ? 'success' : partial ? 'warning' : 'error'"
      :title="
        correct ? '正确！' : partial ? '部分正确，请重试' : '选择有误，请重试'
      "
      style="margin-top: 12px"
    />

    <n-space style="margin-top: 12px" :size="8">
      <n-button
        type="primary"
        size="small"
        :disabled="selected.size === 0 || correct"
        @click="submit"
      >
        提交
      </n-button>
      <n-button size="small" @click="reset">重置</n-button>
    </n-space>
  </n-card>
</template>

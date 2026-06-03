<script setup lang="ts">
import { Exercise, ExerciseMcqData } from "utils/types"

const props = defineProps<{ exercise: Exercise }>()

function renderInlineCode(s: string): string {
  return s.replace(
    /`([^`]+)`/g,
    (_, code) => `<code style="background:rgba(127,127,127,0.12);padding:2px 6px;border-radius:4px;font-family:Monaco,monospace;font-size:14px">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`,
  )
}
const data = computed(() => props.exercise.data as ExerciseMcqData)
const isSingle = computed(() => data.value.answer.length === 1)

const selected = ref<Set<number>>(new Set())
const correct = ref(false)
const wrong = ref(false)
const partial = ref(false)

function select(idx: number) {
  if (correct.value) return
  const s = new Set(selected.value)
  if (isSingle.value) {
    s.clear()
    if (!selected.value.has(idx)) s.add(idx)
  } else {
    if (s.has(idx)) s.delete(idx)
    else s.add(idx)
  }
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
    selected.value = new Set()
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
    style="margin: 16px 0; border: 1.5px solid var(--n-border-color)"
  >
    <template #header>
      <n-space align="center" :size="8">
        <n-tag type="success" :bordered="false">
          练一练 · {{ isSingle ? "单选题" : "多选题" }}
        </n-tag>
      </n-space>
    </template>

    <p style="font-weight: 500; font-size: 16px; margin-bottom: 12px" v-html="renderInlineCode(data.question)" />

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
        <span v-html="renderInlineCode(opt)" />
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
        :disabled="selected.size === 0 || correct"
        @click="submit"
      >
        提交
      </n-button>
      <n-button @click="reset">重置</n-button>
    </n-space>
  </n-card>
</template>

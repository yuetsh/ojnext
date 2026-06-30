<script setup lang="ts">
import { Exercise, ExerciseDebugData } from "utils/types"
import { highlightLines } from "../composables/useCodeHighlight"
import "./exercise-highlight.css"

const props = defineProps<{ exercise: Exercise; lang?: string }>()
const data = computed(() => props.exercise.data as ExerciseDebugData)

const lineHtml = computed(() => highlightLines(data.value.lines, props.lang))
const selected = ref<Set<number>>(new Set())
const submitted = ref(false)

watch(() => props.exercise.id, reset, { immediate: true })

const allCorrect = computed(() => {
  const ans = new Set(data.value.answer)
  if (selected.value.size !== ans.size) return false
  for (const i of selected.value) if (!ans.has(i)) return false
  return true
})
const locked = computed(() => submitted.value && allCorrect.value)

function toggle(i: number) {
  if (locked.value) return
  submitted.value = false
  const s = new Set(selected.value)
  if (s.has(i)) s.delete(i)
  else s.add(i)
  selected.value = s
}

function lineStatus(i: number): "correct" | "wrong" | "selected" | "default" {
  if (!submitted.value) return selected.value.has(i) ? "selected" : "default"
  const isAns = data.value.answer.includes(i)
  const isSel = selected.value.has(i)
  if (isAns) return isSel ? "correct" : "wrong" // 漏选也标红
  if (isSel) return "wrong"
  return "default"
}

function lineStyle(i: number): Record<string, string> {
  const status = lineStatus(i)
  const color =
    status === "correct"
      ? "#18a058"
      : status === "wrong"
        ? "#d03050"
        : status === "selected"
          ? "#2080f0"
          : "var(--n-border-color)"
  const plain = color === "var(--n-border-color)"
  return {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 12px",
    borderRadius: "6px",
    border: `1.5px solid ${color}`,
    background: plain ? "transparent" : color + "14",
    cursor: locked.value ? "default" : "pointer",
    fontFamily: "Monaco",
    userSelect: "none",
  }
}

function submit() {
  submitted.value = true
}

function reset() {
  selected.value = new Set()
  submitted.value = false
}
</script>

<template>
  <n-card style="margin: 16px 0; border: 1.5px solid var(--n-border-color)">
    <template #header>
      <n-tag type="info" :bordered="false">练一练 · 代码找错</n-tag>
    </template>

    <p style="font-weight: 500; font-size: 16px; margin-bottom: 8px">
      {{ data.question }}
    </p>
    <p style="color: var(--n-text-color-3); font-size: 13px; margin: 0 0 12px">
      点击你认为有错误的代码行（可多选）。
    </p>

    <n-space vertical :size="6">
      <div
        v-for="(line, idx) in data.lines"
        :key="idx"
        :style="lineStyle(idx)"
        @click="toggle(idx)"
      >
        <span
          style="color: #bbb; width: 22px; text-align: right; flex-shrink: 0"
        >
          {{ idx + 1 }}
        </span>
        <span v-html="lineHtml[idx]" style="white-space: pre" />
      </div>
    </n-space>

    <n-alert
      v-if="submitted"
      :type="allCorrect ? 'success' : 'error'"
      :title="allCorrect ? '找对了！' : '还没找全，红色行是错误所在'"
      style="margin-top: 12px"
    >
      <template v-if="submitted && data.explanation" #default>
        {{ data.explanation }}
      </template>
    </n-alert>

    <n-space style="margin-top: 12px" :size="8">
      <n-button type="info" :disabled="locked" @click="submit">提交</n-button>
      <n-button @click="reset">重置</n-button>
    </n-space>
  </n-card>
</template>

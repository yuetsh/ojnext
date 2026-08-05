<script setup lang="ts">
import type { Exercise, ExerciseSortData } from "utils/types"
import { shuffle } from "../composables/useShuffle"
import { highlightLines } from "../composables/useCodeHighlight"
import "./exercise-highlight.css"

const props = defineProps<{ exercise: Exercise; lang?: string }>()
const data = computed(() => props.exercise.data as ExerciseSortData)

type LineItem = { originalIdx: number; text: string }

const lines = ref<LineItem[]>([])
const submitted = ref(false)

function init() {
  const shuffled = shuffle(
    data.value.lines.map((text, idx) => ({ originalIdx: idx, text })),
  )
  // 打乱后若恰好与原顺序一致，交换前两项，避免一进入就是已解出状态
  const isCorrect = shuffled.every((item, i) => item.originalIdx === i)
  if (isCorrect && shuffled.length > 1) {
    ;[shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]]
  }
  lines.value = shuffled
  submitted.value = false
}

onMounted(init)
watch(() => props.exercise.id, init)

const dragIdx = ref<number | null>(null)

function onDragStart(idx: number) {
  dragIdx.value = idx
}

function onDrop(targetIdx: number) {
  if (dragIdx.value === null || dragIdx.value === targetIdx) return
  const newLines = [...lines.value]
  const [moved] = newLines.splice(dragIdx.value, 1)
  newLines.splice(targetIdx, 0, moved)
  lines.value = newLines
  dragIdx.value = null
  submitted.value = false
}

function lineStatus(idx: number): "correct" | "wrong" | "default" {
  if (!submitted.value) return "default"
  return lines.value[idx].originalIdx === idx ? "correct" : "wrong"
}

const allCorrect = computed(() =>
  lines.value.every((item, i) => item.originalIdx === i),
)

function submit() {
  submitted.value = true
}

function reset() {
  init()
}

const lineHtml = computed<string[]>(() =>
  highlightLines(data.value.lines, props.lang),
)
</script>

<template>
  <n-card style="margin: 16px 0; border: 1.5px solid var(--n-border-color)">
    <template #header>
      <n-tag type="info" :bordered="false">练一练 · 代码排序</n-tag>
    </template>

    <p style="font-weight: 500; font-size: 16px; margin-bottom: 12px">
      {{ data.question }}
    </p>

    <n-space vertical :size="6">
      <div
        v-for="(line, idx) in lines"
        :key="line.originalIdx"
        draggable="true"
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          borderRadius: '6px',
          border: `1.5px ${submitted ? 'solid' : 'dashed'} ${
            lineStatus(idx) === 'correct'
              ? '#18a058'
              : lineStatus(idx) === 'wrong'
                ? '#d03050'
                : 'var(--n-border-color)'
          }`,
          background:
            lineStatus(idx) === 'correct'
              ? 'rgba(24,160,88,0.08)'
              : lineStatus(idx) === 'wrong'
                ? 'rgba(208,48,80,0.07)'
                : 'transparent',
          cursor: 'grab',
          fontFamily: 'Monaco',
          userSelect: 'none',
        }"
        @dragstart="onDragStart(idx)"
        @dragover.prevent
        @drop="onDrop(idx)"
      >
        <span style="color: #bbb; cursor: grab">⠿</span>
        <span v-html="lineHtml[line.originalIdx]" style="white-space: pre" />
      </div>
    </n-space>

    <n-alert
      v-if="submitted"
      :type="allCorrect ? 'success' : 'error'"
      :title="allCorrect ? '顺序正确！' : '顺序有误，红色行需要调整'"
      style="margin-top: 12px"
    />

    <n-space style="margin-top: 12px" :size="8">
      <n-button type="info" :disabled="submitted && allCorrect" @click="submit">
        提交
      </n-button>
      <n-button @click="reset">重置</n-button>
    </n-space>
  </n-card>
</template>

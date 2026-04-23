<script setup lang="ts">
import { Exercise, ExerciseSortData } from "utils/types"

const props = defineProps<{ exercise: Exercise }>()
const data = computed(() => props.exercise.data as ExerciseSortData)

type LineItem = { originalIdx: number; text: string }

const lines = ref<LineItem[]>([])
const submitted = ref(false)

function shuffle(arr: LineItem[]): LineItem[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  const isCorrect = a.every((item, i) => item.originalIdx === i)
  return isCorrect && a.length > 1 ? shuffle(arr) : a
}

function init() {
  lines.value = shuffle(data.value.lines.map((text, idx) => ({ originalIdx: idx, text })))
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
}

function lineStatus(idx: number): "correct" | "wrong" | "default" {
  if (!submitted.value) return "default"
  return lines.value[idx].originalIdx === idx ? "correct" : "wrong"
}

const allCorrect = computed(() => lines.value.every((item, i) => item.originalIdx === i))

function submit() {
  submitted.value = true
}

function reset() {
  init()
}
</script>

<template>
  <n-card size="small" style="margin: 16px 0; border: 1.5px solid var(--n-border-color)">
    <template #header>
      <n-tag type="info" size="small" :bordered="false">练一练 · 代码排序</n-tag>
    </template>

    <p style="font-weight: 500; margin-bottom: 12px">{{ data.question }}</p>

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
          fontFamily: 'monospace',
          fontSize: '13px',
          userSelect: 'none',
        }"
        @dragstart="onDragStart(idx)"
        @dragover.prevent
        @drop="onDrop(idx)"
      >
        <span style="color: #bbb; cursor: grab">⠿</span>
        <span>{{ line.text }}</span>
      </div>
    </n-space>

    <n-alert
      v-if="submitted"
      :type="allCorrect ? 'success' : 'error'"
      :title="allCorrect ? '顺序正确！' : '顺序有误，红色行需要调整'"
      style="margin-top: 12px"
    />

    <n-space style="margin-top: 12px" :size="8">
      <n-button type="info" size="small" :disabled="submitted" @click="submit">
        提交
      </n-button>
      <n-button size="small" @click="reset">重置</n-button>
    </n-space>
  </n-card>
</template>

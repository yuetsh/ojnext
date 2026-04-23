<script setup lang="ts">
import hljs from "highlight.js/lib/core"
import python from "highlight.js/lib/languages/python"
import c from "highlight.js/lib/languages/c"
import { Exercise, ExerciseSortData } from "utils/types"

hljs.registerLanguage("python", python)
hljs.registerLanguage("c", c)

const props = defineProps<{ exercise: Exercise; lang?: string }>()
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
  if (isCorrect && a.length > 1) [a[0], a[1]] = [a[1], a[0]]
  return a
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
  submitted.value = false
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

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

const lineHtmlMap = computed<Record<number, string>>(() => {
  const rawLines = data.value.lines
  const map: Record<number, string> = {}
  const lang = props.lang === "python" ? "python" : props.lang === "c" ? "c" : null

  if (lang) {
    try {
      const result = hljs.highlight(rawLines.join("\n"), { language: lang }).value
      result.split("\n").forEach((html, i) => {
        map[i] = html
      })
    } catch {
      // fall through
    }
  }

  rawLines.forEach((text, i) => {
    if (map[i] === undefined) map[i] = escapeHtml(text)
  })

  return map
})
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
        <span v-html="lineHtmlMap[line.originalIdx]" style="white-space: pre" />
      </div>
    </n-space>

    <n-alert
      v-if="submitted"
      :type="allCorrect ? 'success' : 'error'"
      :title="allCorrect ? '顺序正确！' : '顺序有误，红色行需要调整'"
      style="margin-top: 12px"
    />

    <n-space style="margin-top: 12px" :size="8">
      <n-button type="info" size="small" :disabled="submitted && allCorrect" @click="submit">
        提交
      </n-button>
      <n-button size="small" @click="reset">重置</n-button>
    </n-space>
  </n-card>
</template>

<style>
.hljs-keyword,
.hljs-operator,
.hljs-selector-tag { color: #d73a49; }
.hljs-string,
.hljs-regexp,
.hljs-template-literal { color: #032f62; }
.hljs-comment,
.hljs-quote { color: #6a737d; font-style: italic; }
.hljs-number,
.hljs-literal { color: #005cc5; }
.hljs-built_in,
.hljs-title.function_,
.hljs-class .hljs-title { color: #6f42c1; }

.dark .hljs-keyword,
.dark .hljs-operator,
.dark .hljs-selector-tag { color: #c678dd; }
.dark .hljs-string,
.dark .hljs-regexp,
.dark .hljs-template-literal { color: #98c379; }
.dark .hljs-comment,
.dark .hljs-quote { color: #7f848e; font-style: italic; }
.dark .hljs-number,
.dark .hljs-literal { color: #e5c07b; }
.dark .hljs-built_in,
.dark .hljs-title.function_,
.dark .hljs-class .hljs-title { color: #61afef; }
</style>

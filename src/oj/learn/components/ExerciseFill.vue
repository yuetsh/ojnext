<script setup lang="ts">
import hljs from "highlight.js/lib/core"
import python from "highlight.js/lib/languages/python"
import c from "highlight.js/lib/languages/c"
import { Exercise, ExerciseFillData } from "utils/types"

hljs.registerLanguage("python", python)
hljs.registerLanguage("c", c)

const props = defineProps<{ exercise: Exercise; lang?: string }>()
const data = computed(() => props.exercise.data as ExerciseFillData)

type CodeSeg = { type: "code"; html: string }
type BlankSeg = { type: "blank"; answers: string[]; index: number }
type Segment = CodeSeg | BlankSeg

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

const segments = computed<Segment[]>(() => {
  const blanks: string[][] = []
  const markedCode = data.value.code.replace(/\{\{([^}]+)\}\}/g, (_, inner) => {
    blanks.push(inner.split("|"))
    return `____${blanks.length - 1}____`
  })

  const lang =
    props.lang === "python" ? "python" : props.lang === "c" ? "c" : null
  let highlighted: string
  if (lang) {
    try {
      highlighted = hljs.highlight(markedCode, { language: lang }).value
    } catch {
      highlighted = escapeHtml(markedCode)
    }
  } else {
    highlighted = escapeHtml(markedCode)
  }

  const parts = highlighted.split(/____(\d+)____/)
  const result: Segment[] = []
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      if (parts[i]) result.push({ type: "code", html: parts[i] })
    } else {
      const idx = parseInt(parts[i])
      result.push({ type: "blank", answers: blanks[idx], index: idx })
    }
  }
  return result
})

const blankCount = computed(
  () => segments.value.filter((s) => s.type === "blank").length,
)
const userInputs = ref<string[]>([])
const wrongBlanks = ref<Set<number>>(new Set())
const allCorrect = ref(false)

watch(() => props.exercise.id, reset, { immediate: true })

function reset() {
  userInputs.value = Array(blankCount.value).fill("")
  wrongBlanks.value = new Set()
  allCorrect.value = false
}

function submit() {
  if (allCorrect.value) return
  const wrong = new Set<number>()
  for (const seg of segments.value) {
    if (seg.type !== "blank") continue
    if (!seg.answers.includes(userInputs.value[seg.index]?.trim() ?? "")) {
      wrong.add(seg.index)
    }
  }
  wrongBlanks.value = wrong
  allCorrect.value = wrong.size === 0
}

function inputWidth(idx: number): string {
  return Math.max(4, (userInputs.value[idx]?.length ?? 0) + 2) + "ch"
}
</script>

<template>
  <n-card
    size="small"
    style="margin: 16px 0; border: 1.5px solid var(--n-border-color)"
  >
    <template #header>
      <n-tag type="warning" size="small" :bordered="false"
        >练一练 · 代码填空</n-tag
      >
    </template>

    <p style="font-weight: 500; margin-bottom: 12px">{{ data.question }}</p>

    <pre
      :style="{
        fontFamily: 'monospace',
        lineHeight: '1.6',
        background: 'var(--n-color)',
        border: '1px solid var(--n-border-color)',
        borderRadius: '6px',
        padding: '12px',
        overflowX: 'auto',
        whiteSpace: 'pre-wrap',
        margin: 0,
      }"
    ><template v-for="(seg, i) in segments" :key="i"
      ><span v-if="seg.type === 'code'" v-html="seg.html" /><input
        v-else
        :value="userInputs[seg.index]"
        :disabled="allCorrect"
        :style="{
          width: inputWidth(seg.index),
          fontFamily: 'monospace',
          padding: '1px 4px',
          borderRadius: '3px',
          border: `1.5px solid ${
            allCorrect
              ? '#18a058'
              : wrongBlanks.has(seg.index)
                ? '#d03050'
                : 'var(--n-border-color)'
          }`,
          background: allCorrect
            ? 'rgba(24,160,88,0.08)'
            : wrongBlanks.has(seg.index)
              ? 'rgba(208,48,80,0.07)'
              : 'transparent',
          outline: 'none',
          color: 'inherit',
          minWidth: '4ch',
        }"
        @input="userInputs[seg.index] = ($event.target as HTMLInputElement).value"
      /></template></pre>

    <n-alert
      v-if="wrongBlanks.size > 0 || allCorrect"
      :type="allCorrect ? 'success' : 'error'"
      :title="allCorrect ? '全部正确！' : '有填写错误，请检查红色标注的空位'"
      style="margin-top: 12px"
    />

    <n-space style="margin-top: 12px" :size="8">
      <n-button
        type="warning"
        size="small"
        :disabled="allCorrect"
        @click="submit"
      >
        提交
      </n-button>
      <n-button size="small" @click="reset">重置</n-button>
    </n-space>
  </n-card>
</template>

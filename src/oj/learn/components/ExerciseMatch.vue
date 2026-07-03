<script setup lang="ts">
import type { Exercise, ExerciseMatchData } from "utils/types"

const props = defineProps<{ exercise: Exercise; lang?: string }>()
const data = computed(() => props.exercise.data as ExerciseMatchData)

const PALETTE = [
  "#2080f0",
  "#18a058",
  "#f0a020",
  "#d03050",
  "#8a2be2",
  "#0891b2",
  "#db2777",
  "#65a30d",
]

const rightOrder = ref<number[]>([]) // 显示顺序里的 right 原始下标
const pairs = ref<(number | null)[]>([]) // pairs[leftIdx] = 配对的 right 原始下标
const selectedLeft = ref<number | null>(null)
const submitted = ref(false)

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function init() {
  const n = data.value.right.length
  rightOrder.value = shuffle(Array.from({ length: n }, (_, i) => i))
  pairs.value = Array(data.value.left.length).fill(null)
  selectedLeft.value = null
  submitted.value = false
}

onMounted(init)
watch(() => props.exercise.id, init)

const allPaired = computed(() => pairs.value.every((p) => p !== null))
const allCorrect = computed(() =>
  pairs.value.every((p, i) => p === data.value.answer[i]),
)
const locked = computed(() => submitted.value && allCorrect.value)

function leftOf(rightIdx: number): number {
  return pairs.value.findIndex((p) => p === rightIdx)
}

function onLeftClick(i: number) {
  if (locked.value) return
  submitted.value = false
  if (pairs.value[i] !== null) {
    pairs.value[i] = null
    selectedLeft.value = i
    return
  }
  selectedLeft.value = selectedLeft.value === i ? null : i
}

function onRightClick(rightIdx: number) {
  if (locked.value) return
  submitted.value = false
  if (selectedLeft.value === null) {
    const l = leftOf(rightIdx)
    if (l !== -1) pairs.value[l] = null
    return
  }
  const prev = leftOf(rightIdx)
  if (prev !== -1) pairs.value[prev] = null
  pairs.value[selectedLeft.value] = rightIdx
  selectedLeft.value = null
}

function submit() {
  submitted.value = true
}

function reset() {
  init()
}

function leftColor(i: number): string {
  if (submitted.value) {
    if (pairs.value[i] === null) return "#d03050"
    return pairs.value[i] === data.value.answer[i] ? "#18a058" : "#d03050"
  }
  if (selectedLeft.value === i) return "#2080f0"
  if (pairs.value[i] !== null) return PALETTE[i % PALETTE.length]
  return "var(--n-border-color)"
}

function rightColor(rightIdx: number): string {
  const l = leftOf(rightIdx)
  if (submitted.value) {
    if (l === -1) return "var(--n-border-color)"
    return pairs.value[l] === data.value.answer[l] ? "#18a058" : "#d03050"
  }
  if (l === -1) return "var(--n-border-color)"
  return PALETTE[l % PALETTE.length]
}

function itemStyle(color: string, selected: boolean): Record<string, string> {
  const plain = color === "var(--n-border-color)"
  return {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 12px",
    borderRadius: "6px",
    border: `${selected ? "2px" : "1.5px"} solid ${color}`,
    background: plain ? "transparent" : color + "14",
    cursor: locked.value ? "default" : "pointer",
    userSelect: "none",
    fontSize: "15px",
  }
}

function dotStyle(color: string): Record<string, string> {
  return {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: color,
    flexShrink: "0",
  }
}
</script>

<template>
  <n-card style="margin: 16px 0; border: 1.5px solid var(--n-border-color)">
    <template #header>
      <n-tag type="primary" :bordered="false">练一练 · 连线匹配</n-tag>
    </template>

    <p style="font-weight: 500; font-size: 16px; margin-bottom: 8px">
      {{ data.question }}
    </p>
    <p style="color: var(--n-text-color-3); font-size: 13px; margin: 0 0 12px">
      先点左边一项，再点右边一项即可连线；点击已连线的项可取消。
    </p>

    <div style="display: flex; gap: 24px; align-items: flex-start">
      <n-space vertical :size="8" style="flex: 1">
        <div
          v-for="(item, i) in data.left"
          :key="'l' + i"
          :style="itemStyle(leftColor(i), selectedLeft === i)"
          @click="onLeftClick(i)"
        >
          <span
            v-if="pairs[i] !== null && !submitted"
            :style="dotStyle(PALETTE[i % PALETTE.length])"
          />
          <span>{{ item }}</span>
        </div>
      </n-space>

      <n-space vertical :size="8" style="flex: 1">
        <div
          v-for="rightIdx in rightOrder"
          :key="'r' + rightIdx"
          :style="itemStyle(rightColor(rightIdx), false)"
          @click="onRightClick(rightIdx)"
        >
          <span
            v-if="leftOf(rightIdx) !== -1 && !submitted"
            :style="dotStyle(PALETTE[leftOf(rightIdx) % PALETTE.length])"
          />
          <span>{{ data.right[rightIdx] }}</span>
        </div>
      </n-space>
    </div>

    <n-alert
      v-if="submitted"
      :type="allCorrect ? 'success' : 'error'"
      :title="allCorrect ? '全部匹配正确！' : '有匹配错误，红色项需要重新连线'"
      style="margin-top: 12px"
    />

    <n-space style="margin-top: 12px" :size="8">
      <n-button type="primary" :disabled="!allPaired || locked" @click="submit">
        提交
      </n-button>
      <n-button @click="reset">重置</n-button>
    </n-space>
  </n-card>
</template>

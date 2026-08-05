<script setup lang="ts">
import type { Exercise, ExerciseGroupData } from "utils/types"
import { shuffle } from "../composables/useShuffle"

const props = defineProps<{ exercise: Exercise; lang?: string }>()
const data = computed(() => props.exercise.data as ExerciseGroupData)

const order = ref<number[]>([]) // item 的稳定展示顺序（初始乱序）
const placement = ref<number[]>([]) // placement[itemIdx] = 桶下标，-1 表示在池中
const dragIdx = ref<number | null>(null)
const submitted = ref(false)

function init() {
  order.value = shuffle(data.value.items.map((_, i) => i))
  placement.value = Array(data.value.items.length).fill(-1)
  dragIdx.value = null
  submitted.value = false
}

onMounted(init)
watch(() => props.exercise.id, init)

const allPlaced = computed(() => placement.value.every((p) => p !== -1))
const allCorrect = computed(() =>
  placement.value.every((p, i) => p === data.value.answer[i]),
)
const locked = computed(() => submitted.value && allCorrect.value)

function onDragStart(i: number) {
  if (locked.value) return
  dragIdx.value = i
}

function dropTo(bucket: number) {
  if (locked.value || dragIdx.value === null) return
  placement.value[dragIdx.value] = bucket
  dragIdx.value = null
  submitted.value = false
}

const poolItems = computed(() =>
  order.value.filter((i) => placement.value[i] === -1),
)
function itemsIn(bucket: number): number[] {
  return order.value.filter((i) => placement.value[i] === bucket)
}

function itemStatus(i: number): "correct" | "wrong" | "default" {
  if (!submitted.value || placement.value[i] === -1) return "default"
  return placement.value[i] === data.value.answer[i] ? "correct" : "wrong"
}

function chipStyle(i: number): Record<string, string> {
  const status = itemStatus(i)
  const color =
    status === "correct"
      ? "#18a058"
      : status === "wrong"
        ? "#d03050"
        : "var(--n-border-color)"
  const plain = color === "var(--n-border-color)"
  return {
    padding: "6px 12px",
    borderRadius: "6px",
    border: `1.5px solid ${color}`,
    background: plain ? "var(--n-color)" : color + "14",
    cursor: locked.value ? "default" : "grab",
    userSelect: "none",
    fontSize: "15px",
  }
}

function submit() {
  submitted.value = true
}

function reset() {
  init()
}
</script>

<template>
  <n-card style="margin: 16px 0; border: 1.5px solid var(--n-border-color)">
    <template #header>
      <n-tag type="warning" :bordered="false">练一练 · 归类分组</n-tag>
    </template>

    <p style="font-weight: 500; font-size: 16px; margin-bottom: 8px">
      {{ data.question }}
    </p>
    <p style="color: var(--n-text-color-3); font-size: 13px; margin: 0 0 12px">
      把下面的项目拖到对应的分组里，可在分组间拖动调整。
    </p>

    <div
      :style="{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        minHeight: '48px',
        padding: '10px',
        border: '1.5px dashed var(--n-border-color)',
        borderRadius: '8px',
        marginBottom: '14px',
      }"
      @dragover.prevent
      @drop="dropTo(-1)"
    >
      <span
        v-if="poolItems.length === 0"
        style="color: var(--n-text-color-3); font-size: 13px"
      >
        （已全部归类）
      </span>
      <div
        v-for="i in poolItems"
        :key="i"
        draggable="true"
        :style="chipStyle(i)"
        @dragstart="onDragStart(i)"
      >
        {{ data.items[i] }}
      </div>
    </div>

    <div
      :style="{
        display: 'grid',
        gridTemplateColumns: `repeat(${data.buckets.length}, 1fr)`,
        gap: '12px',
      }"
    >
      <div
        v-for="(bucket, b) in data.buckets"
        :key="b"
        :style="{
          minHeight: '88px',
          padding: '10px',
          border: '1.5px solid var(--n-border-color)',
          borderRadius: '8px',
        }"
        @dragover.prevent
        @drop="dropTo(b)"
      >
        <p
          style="
            font-weight: 600;
            margin: 0 0 8px;
            text-align: center;
            font-size: 14px;
          "
        >
          {{ bucket }}
        </p>
        <n-space :size="8">
          <div
            v-for="i in itemsIn(b)"
            :key="i"
            draggable="true"
            :style="chipStyle(i)"
            @dragstart="onDragStart(i)"
          >
            {{ data.items[i] }}
          </div>
        </n-space>
      </div>
    </div>

    <n-alert
      v-if="submitted"
      :type="allCorrect ? 'success' : 'error'"
      :title="allCorrect ? '归类全部正确！' : '有归类错误，红色项需要调整'"
      style="margin-top: 12px"
    />

    <n-space style="margin-top: 12px" :size="8">
      <n-button type="warning" :disabled="!allPlaced || locked" @click="submit">
        提交
      </n-button>
      <n-button @click="reset">重置</n-button>
    </n-space>
  </n-card>
</template>

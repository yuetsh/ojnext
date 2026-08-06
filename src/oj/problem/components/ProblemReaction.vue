<template>
  <n-alert v-if="!userStore.isAuthed" type="error" title="请先登录" />
  <div v-else class="reactions">
    <n-tooltip v-for="item in REACTIONS" :key="item.key" trigger="hover">
      <template #trigger>
        <button
          class="reaction-button"
          :class="{ active: mine.includes(item.key) }"
          :disabled="isDisabled(item.key)"
          @click="toggle(item.key)"
        >
          <Icon :icon="item.icon" :width="28" />
          <span v-if="counts" class="count">×{{ counts[item.key] }}</span>
        </button>
      </template>
      {{ tooltipOf(item.key, item.label) }}
    </n-tooltip>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { storeToRefs } from "pinia"
import { getReaction, setReaction } from "oj/api"
import { useProblemStore } from "oj/store/problem"
import { useUserStore } from "shared/store/user"
import { MAX_REACTIONS, REACTIONS } from "utils/constants"
import type { ReactionCounts, ReactionKey } from "utils/types"

const userStore = useUserStore()
const problemStore = useProblemStore()
const { problem } = storeToRefs(problemStore)
const message = useMessage()

const mine = ref<ReactionKey[]>([])
const counts = ref<ReactionCounts | null>(null)

const solved = computed(() => problem.value?.my_status === 0)

function isDisabled(key: ReactionKey) {
  if (!solved.value) return true
  if (mine.value.includes(key)) return false
  return mine.value.length >= MAX_REACTIONS
}

function tooltipOf(key: ReactionKey, label: string) {
  if (!solved.value) return "完成本题后可以评价"
  if (isDisabled(key)) return `最多选 ${MAX_REACTIONS} 个，先取消一个`
  return label
}

// 连续点击不做防抖、不禁用按钮，靠请求代号保证后到的旧响应不会覆盖新状态：
// 每次点击自增一次，只有仍是最新请求时才把结果写回本地状态
let requestSeq = 0

async function toggle(key: ReactionKey) {
  if (!problem.value) return
  const prevMine = [...mine.value]
  const prevCounts = counts.value ? { ...counts.value } : null
  const selected = mine.value.includes(key)
  const next = selected
    ? mine.value.filter((k) => k !== key)
    : [...mine.value, key]

  mine.value = next
  if (counts.value) counts.value[key] += selected ? -1 : 1

  const seq = ++requestSeq
  try {
    const res = await setReaction(problem.value.id, next)
    if (seq !== requestSeq) return
    mine.value = res.data.mine
    counts.value = res.data.counts
  } catch {
    if (seq !== requestSeq) return
    mine.value = prevMine
    counts.value = prevCounts
    message.error("操作失败，请重试")
  }
}

async function load() {
  if (!problem.value) return
  const res = await getReaction(problem.value.id)
  mine.value = res.data.mine
  counts.value = res.data.counts
}

onMounted(() => {
  if (userStore.isAuthed) load()
})
</script>

<style scoped>
/* 七个按钮一行约需 700px，窄面板放不下就换行，不做横向滚动免得按钮被藏起来 */
.reactions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.reaction-button {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 48px;
  padding: 0 14px;
  border: 1px solid rgba(128, 128, 128, 0.3);
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background-color 0.2s;
}
.reaction-button:hover:not(:disabled) {
  border-color: rgba(128, 128, 128, 0.6);
  background: rgba(128, 128, 128, 0.1);
}
.reaction-button.active {
  border-color: #18a058;
  background: rgba(24, 160, 88, 0.12);
}
.reaction-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.count {
  font-size: 15px;
  opacity: 0.7;
}
</style>

<template>
  <n-alert v-if="!userStore.isAuthed" type="error" title="请先登录" />
  <div v-else ref="container" class="reactions">
    <n-tooltip v-for="item in REACTIONS" :key="item.key" trigger="hover">
      <template #trigger>
        <span class="reaction-trigger">
          <n-button
            size="small"
            :disabled="isDisabled(item.key)"
            :type="mine.includes(item.key) ? 'primary' : 'default'"
            :ghost="mine.includes(item.key)"
            @click="toggle(item.key)"
          >
            <Icon :icon="item.icon" :width="18" />
            <span v-if="showLabel" class="label">{{ item.label }}</span>
            <span v-if="counts" class="count">{{ counts[item.key] }}</span>
          </n-button>
        </span>
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

const container = ref<HTMLElement | null>(null)
const { width } = useElementSize(container)
// 七个按钮带中文标签大约需要 560px，放不下就只留图标和计数
const showLabel = computed(() => width.value >= 560)

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
  if (counts.value) return `${counts.value[key]} 人选了「${label}」`
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
.reactions {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  overflow-x: auto;
}
.reaction-trigger {
  display: inline-flex;
  flex-shrink: 0;
}
.label {
  margin-left: 4px;
}
.count {
  margin-left: 6px;
  opacity: 0.7;
}
</style>

<template>
  <n-alert v-if="!userStore.isAuthed" type="error" title="请先登录" />
  <div v-else>
    <div class="reactions">
      <n-tooltip v-for="item in REACTIONS" :key="item.key" trigger="hover">
        <template #trigger>
          <button
            class="reaction-button"
            :class="{ active: selected.includes(item.key) }"
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
    <n-flex v-if="solved && !locked" align="center" class="footer">
      <n-button
        type="primary"
        size="small"
        :disabled="!selected.length"
        :loading="submitting"
        @click="submit"
      >
        提交评价
      </n-button>
      <span class="hint">最多选 {{ MAX_REACTIONS }} 个，提交后不能修改</span>
    </n-flex>
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

// selected 是本地待提交的选择，提交成功后就是 mine，之后不可再改
const selected = ref<ReactionKey[]>([])
const counts = ref<ReactionCounts | null>(null)
const submitting = ref(false)

const solved = computed(() => problem.value?.my_status === 0)
// 评价一次定终身：后端已存在记录就锁死，只剩查看
const locked = ref(false)

function isDisabled(key: ReactionKey) {
  if (!solved.value || locked.value || submitting.value) return true
  if (selected.value.includes(key)) return false
  return selected.value.length >= MAX_REACTIONS
}

function tooltipOf(key: ReactionKey, label: string) {
  if (!solved.value) return "完成本题后可以评价"
  if (locked.value) return `${label}（已评价，不能修改）`
  if (isDisabled(key)) return `最多选 ${MAX_REACTIONS} 个，先取消一个`
  return label
}

function toggle(key: ReactionKey) {
  selected.value = selected.value.includes(key)
    ? selected.value.filter((k) => k !== key)
    : [...selected.value, key]
}

async function submit() {
  if (!problem.value || !selected.value.length) return
  submitting.value = true
  try {
    const res = await setReaction(problem.value.id, selected.value)
    selected.value = res.data.mine
    counts.value = res.data.counts
    locked.value = true
  } catch {
    message.error("提交失败，请重试")
  } finally {
    submitting.value = false
  }
}

async function load() {
  if (!problem.value) return
  const res = await getReaction(problem.value.id)
  selected.value = res.data.mine
  counts.value = res.data.counts
  locked.value = res.data.mine.length > 0
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
/* 锁定后选中的那几个仍要看得清，不然自己评过什么都糊成一片 */
.reaction-button.active:disabled {
  opacity: 1;
}
.footer {
  margin-top: 12px;
}
.hint {
  font-size: 13px;
  opacity: 0.6;
}
.count {
  font-size: 15px;
  opacity: 0.7;
}
</style>

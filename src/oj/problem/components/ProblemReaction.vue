<template>
  <n-alert v-if="!userStore.isAuthed" type="error" title="请先登录" />
  <div v-else>
    <n-flex class="reactions">
      <n-tooltip
        v-for="item in REACTIONS"
        :key="item.key"
        trigger="hover"
        :disabled="solved && !locked"
      >
        <template #trigger>
          <n-button
            :type="mine === item.key ? 'primary' : 'tertiary'"
            :secondary="mine === item.key"
            :disabled="!solved || locked || submitting"
            :loading="submitting === item.key"
            @click="pick(item.key)"
          >
            <template #icon>
              <Icon :icon="item.icon" :width="20" />
            </template>
            {{ item.label }}
            <span v-if="counts" class="count">{{ counts[item.key] }}</span>
          </n-button>
        </template>
        {{ tooltipOf(item.label) }}
      </n-tooltip>
    </n-flex>
    <div v-if="solved" class="hint">
      {{ locked ? "已评价，不能修改" : "选一个，点了直接提交，不能修改" }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { storeToRefs } from "pinia"
import { getReaction, setReaction } from "oj/api"
import { useProblemStore } from "oj/store/problem"
import { useUserStore } from "shared/store/user"
import { REACTIONS } from "utils/constants"
import type { ReactionCounts, ReactionKey } from "utils/types"

const emit = defineEmits<{ submitted: [] }>()

const userStore = useUserStore()
const problemStore = useProblemStore()
const { problem } = storeToRefs(problemStore)
const message = useMessage()

const mine = ref<ReactionKey | null>(null)
const counts = ref<ReactionCounts | null>(null)
// 正在提交的那个 key，用来只给被点的按钮转圈
const submitting = ref<ReactionKey | null>(null)

const solved = computed(() => problem.value?.my_status === 0)
// 评价一次定终身：后端已存在记录就锁死，只剩查看
const locked = ref(false)

function tooltipOf(label: string) {
  if (!solved.value) return "完成本题后可以评价"
  return `${label}（已评价，不能修改）`
}

async function pick(key: ReactionKey) {
  if (!problem.value) return
  submitting.value = key
  try {
    const res = await setReaction(problem.value.id, key)
    mine.value = res.data.mine
    counts.value = res.data.counts
    locked.value = true
    emit("submitted")
  } catch {
    message.error("提交失败，请重试")
  } finally {
    submitting.value = null
  }
}

async function load() {
  if (!problem.value) return
  const res = await getReaction(problem.value.id)
  mine.value = res.data.mine
  counts.value = res.data.counts
  locked.value = res.data.mine !== null
}

onMounted(() => {
  if (userStore.isAuthed) load()
})
</script>

<style scoped>
/* 七个按钮一行放不下就换行，不做横向滚动免得按钮被藏起来 */
.reactions {
  gap: 8px;
}
/* 锁定后选中的那颗仍要看得清，不然自己评过什么都糊成一片 */
.reactions :deep(.n-button.n-button--disabled) {
  opacity: 0.6;
}
.reactions :deep(.n-button--primary-type.n-button--disabled) {
  opacity: 1;
}
.count {
  margin-left: 6px;
  opacity: 0.7;
  font-variant-numeric: tabular-nums;
}
.hint {
  margin-top: 12px;
  font-size: 13px;
  opacity: 0.6;
}
</style>

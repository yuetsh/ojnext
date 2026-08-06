<template>
  <n-alert v-if="!userStore.isAuthed" type="error" title="请先登录" />
  <div v-else>
    <n-flex>
      <n-tooltip
        v-for="item in REACTIONS"
        :key="item.key"
        trigger="hover"
        :disabled="solved"
      >
        <template #trigger>
          <n-button
            :type="mine === item.key ? 'primary' : 'tertiary'"
            :secondary="mine === item.key"
            :disabled="!solved || locked || !!submitting"
            :loading="submitting === item.key"
            @click="pick(item.key)"
          >
            <template #icon>
              <Icon :icon="item.icon" :width="20" />
            </template>
            {{ item.label }}
            <span v-if="counts">{{ counts[item.key] }}</span>
          </n-button>
        </template>
        完成本题后可以评价
      </n-tooltip>
    </n-flex>
    <n-text v-if="solved">
      {{ locked ? "已评价，不能修改" : "选一个，点了直接提交，不能修改" }}
    </n-text>
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
const locked = computed(() => mine.value !== null)

async function pick(key: ReactionKey) {
  if (!problem.value) return
  submitting.value = key
  try {
    const res = await setReaction(problem.value.id, key)
    mine.value = res.data.mine
    counts.value = res.data.counts
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
}

onMounted(() => {
  if (userStore.isAuthed) load()
})
</script>

<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { storeToRefs } from "pinia"
import { getComment, submitCode, updateProblemSetProgress } from "oj/api"
import { useCodeStore } from "oj/store/code"
import { useProblemStore } from "oj/store/problem"
import { useFireworks } from "oj/problem/composables/useFireworks"
import { useSubmissionMonitor } from "oj/problem/composables/useSubmissionMonitor"
import { SubmissionStatus } from "utils/constants"
import type { SubmitCodePayload } from "utils/types"
import SubmissionResult from "./SubmissionResult.vue"
import { useBreakpoints } from "shared/composables/breakpoints"
import { useUserStore } from "shared/store/user"

// ==================== 异步组件 ====================
const ProblemComment = defineAsyncComponent(
  () => import("./ProblemComment.vue"),
)

// ==================== 基础状态 ====================
const userStore = useUserStore()
const codeStore = useCodeStore()
const problemStore = useProblemStore()
const { problem } = storeToRefs(problemStore)
const route = useRoute()
const contestID = <string>route.params.contestID ?? ""
const problemSetId = <string>route.params.problemSetId ?? ""
console.log(problemSetId, "problemSetId")
const [commentPanel] = useToggle()

const { isDesktop } = useBreakpoints()

// ==================== 烟花效果 ====================
const { celebrate } = useFireworks()

// ==================== 判题监控 ====================
const {
  submission,
  judging,
  pending,
  submitting,
  isProcessing,
  startMonitoring,
} = useSubmissionMonitor()

// ==================== 提交冷却 ====================
const { start: startCooldown, isPending: isCooldown } = useTimeout(5000, {
  controls: true,
  immediate: false,
})

// ==================== AC后显示评论框 ====================
const { start: showCommentPanelDelayed } = useTimeoutFn(
  async () => {
    const res = await getComment(problem.value!.id)
    if (!res.data) {
      commentPanel.value = true
    }
  },
  1500,
  { immediate: false },
)

// ==================== 计算属性 ====================
// 按钮禁用逻辑
const submitDisabled = computed(() => {
  return (
    !userStore.isAuthed ||
    codeStore.code.value.trim() === "" ||
    isProcessing.value ||
    isCooldown.value
  )
})

// 按钮文案
const submitLabel = computed(() => {
  if (!userStore.isAuthed) return "请先登录"
  if (submitting.value) return "正在提交"
  if (judging.value || pending.value) return "正在评分"
  if (isCooldown.value) return "正在冷却"
  return "提交代码"
})

// 按钮图标
const submitIcon = computed(() => {
  if (isProcessing.value) return "eos-icons:loading"
  if (isCooldown.value) return "ph:lightbulb-fill"
  return "ph:play-fill"
})

// ==================== 提交函数 ====================
async function submit() {
  if (!userStore.isAuthed) return

  // 1. 构建提交数据
  const data: SubmitCodePayload = {
    problem_id: problem.value!.id,
    language: codeStore.code.language,
    code: codeStore.code.value,
  }
  if (contestID) {
    data.contest_id = parseInt(contestID)
  }
  if (problemSetId) {
    data.problemset_id = parseInt(problemSetId)
  }

  // 2. 提交代码到后端
  const res = await submitCode(data)
  console.log(`[Submit] 代码已提交: ID=${res.data.submission_id}`)

  // 3. 启动冷却 + 监控
  startCooldown()
  startMonitoring(res.data.submission_id)
}

// ==================== AC庆祝效果 ====================
watch(
  () => submission.value?.result,
  async (result) => {
    if (result !== SubmissionStatus.accepted) return

    // 1. 刷新题目状态
    problem.value!.my_status = 0

    // 2. 更新题单进度
    if (problemSetId) {
      console.log(problemSetId, "problemSetId")
      try {
        await updateProblemSetProgress(Number(problemSetId), problem.value!.id)
      } catch (error) {
        console.error("更新题单进度失败:", error)
      }
    }

    // 3. 放烟花
    celebrate()

    // 4. 显示评价框
    if (!contestID && !problemSetId) {
      showCommentPanelDelayed()
    }
  },
)
</script>

<template>
  <!-- 提交按钮 + 结果弹窗 -->
  <n-popover
    trigger="click"
    placement="bottom-end"
    scrollable
    :show-arrow="false"
    style="max-height: 600px"
  >
    <template #trigger>
      <n-button
        :size="isDesktop ? 'medium' : 'small'"
        type="primary"
        :disabled="submitDisabled"
        @click="submit"
      >
        <template #icon>
          <n-icon>
            <Icon :icon="submitIcon" />
          </n-icon>
        </template>
        {{ submitLabel }}
      </n-button>
    </template>

    <!-- 结果展示 -->
    <SubmissionResult :submission="submission" />
  </n-popover>

  <!-- 评价弹窗 -->
  <n-modal
    preset="card"
    title="恭喜你成功提交，请对该题进行评价（一星差评，五星好评）"
    :mask-closable="false"
    :style="{ maxWidth: isDesktop && '50vw', maxHeight: '80vh' }"
    v-model:show="commentPanel"
  >
    <ProblemComment :showStatistics="false" />
  </n-modal>
</template>

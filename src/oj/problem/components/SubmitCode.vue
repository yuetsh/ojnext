<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { storeToRefs } from "pinia"
import {
  formatCode,
  getComment,
  submitCode,
  updateProblemSetProgress,
} from "oj/api"
import { useCodeStore } from "oj/store/code"
import { useProblemStore } from "oj/store/problem"
import { useFireworks } from "oj/problem/composables/useFireworks"
import { useSubmissionMonitor } from "oj/problem/composables/useSubmissionMonitor"
import { LANGUAGE_FORMAT_VALUE, SubmissionStatus } from "utils/constants"
import type { SubmitCodePayload } from "utils/types"
import SubmissionResult from "./SubmissionResult.vue"
import { getSubmitButtonState } from "./submitButtonState"
import { useBreakpoints } from "shared/composables/breakpoints"
import { useUserStore } from "shared/store/user"
import { checkPythonSyntax } from "oj/problem/utils/pythonSyntaxCheck"

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
const contestID = (route.params.contestID as string) ?? ""
const problemSetId = (route.params.problemSetId as string) ?? ""

const router = useRouter()
const [commentPanel] = useToggle()
const message = useMessage()

const { isDesktop } = useBreakpoints()

// ==================== 烟花效果 ====================
const { celebrate } = useFireworks()

// ==================== 判题监控 ====================
const { submission, judging, pending, submitting, startMonitoring } =
  useSubmissionMonitor()

const showResult = ref(false)
const isFormatting = ref(false)
const isSubmittingRequest = ref(false)

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

const { start: goToProblemSetDelayed } = useTimeoutFn(
  () => {
    router.push({
      name: "problemset",
      params: {
        problemSetId: problemSetId,
      },
    })
  },
  1500,
  { immediate: false },
)

// ==================== 计算属性 ====================
const buttonState = computed(() =>
  getSubmitButtonState({
    isAuthed: userStore.isAuthed,
    hasCode: codeStore.code.value.trim() !== "",
    isFormatting: isFormatting.value,
    isSubmitting: isSubmittingRequest.value || submitting.value,
    isJudging: judging.value || pending.value,
    isCooldown: isCooldown.value,
  }),
)

// ==================== 提交函数 ====================
async function submit() {
  if (buttonState.value.disabled) return

  // 0. Python3 语法检测
  if (codeStore.code.language === "Python3") {
    const syntaxError = checkPythonSyntax(codeStore.code.value)
    if (syntaxError) {
      message.warning(`第 ${syntaxError.line} 行存在语法错误，请修正后再提交`)
      return
    }
  }

  // 0.5 提交前自动格式化（Python3 用 ruff，C/C++ 用 clang-format，SQL 用 sqlparse）
  const formatLang = LANGUAGE_FORMAT_VALUE[codeStore.code.language]
  if (["python", "c", "cpp", "sql"].includes(formatLang)) {
    isFormatting.value = true
    try {
      const res = await formatCode({
        code: codeStore.code.value,
        language: formatLang,
      })
      codeStore.setCode(res.data.code)
    } catch (e: any) {
      if (e?.error === "format-error") {
        // 仅 Python3 会出现：代码本身存在语法错误
        message.warning(`代码格式化失败：${e.data}，请检查代码后重试`)
        return
      }
      // server-error / 网络异常：格式化工具问题，静默降级，提交原代码
    } finally {
      isFormatting.value = false
    }
  }

  // 1. 构建提交数据
  const data: SubmitCodePayload = {
    problem_id: problem.value!.id,
    language: codeStore.code.language,
    code: codeStore.code.value,
  }
  if (contestID) {
    data.contest_id = parseInt(contestID)
  }
  // 2. 提交代码到后端
  isSubmittingRequest.value = true
  try {
    const res = await submitCode(data)
    console.log(`[Submit] 代码已提交: ID=${res.data.submission_id}`)

    // 3. 启动冷却 + 监控
    startCooldown()
    startMonitoring(res.data.submission_id)
    showResult.value = true
  } finally {
    isSubmittingRequest.value = false
  }
}

// ==================== 失败计数 ====================
watch(
  () => submission.value?.result,
  (result) => {
    if (result === undefined || result === null) return
    if (
      result === SubmissionStatus.pending ||
      result === SubmissionStatus.judging ||
      result === SubmissionStatus.submitting
    )
      return
    if (
      result !== SubmissionStatus.accepted &&
      result !== SubmissionStatus.ast_check_failed
    ) {
      problemStore.incrementFailCount()
    }
  },
)

// ==================== AC庆祝效果 ====================
watch(
  () => submission.value?.result,
  async (result) => {
    if (
      result !== SubmissionStatus.accepted &&
      result !== SubmissionStatus.ast_check_failed
    )
      return

    // 1. 刷新题目状态
    problem.value!.my_status = 0

    // 2. 创建ProblemSetSubmission记录，更新题单进度
    if (problemSetId) {
      await updateProblemSetProgress(
        Number(problemSetId),
        problem.value!.id,
        submission.value!.id,
      )
    }

    if (result !== SubmissionStatus.accepted) return

    // 3. 放烟花
    celebrate()

    // 4. 显示评价框
    if (!contestID && !problemSetId) {
      showCommentPanelDelayed()
    }

    if (problemSetId) {
      // 延迟回到题单页面
      goToProblemSetDelayed()
    }
  },
)
</script>

<template>
  <!-- 提交按钮 + 结果弹窗 -->
  <n-popover
    trigger="manual"
    placement="bottom-end"
    scrollable
    :show-arrow="false"
    style="max-height: 600px"
    :show="showResult"
    @clickoutside="showResult = false"
  >
    <template #trigger>
      <n-button
        :size="isDesktop ? 'medium' : 'small'"
        type="primary"
        :disabled="buttonState.disabled"
        @click="submit"
      >
        <template #icon>
          <n-icon>
            <Icon :icon="buttonState.icon" />
          </n-icon>
        </template>
        {{ buttonState.label }}
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

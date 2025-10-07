<script setup lang="ts">
import { Icon } from "@iconify/vue"
import confetti from "canvas-confetti"
import { getComment, getSubmission, submitCode } from "oj/api"
import { code } from "oj/composables/code"
import { problem } from "oj/composables/problem"
import { JUDGE_STATUS, SubmissionStatus } from "utils/constants"
import { submissionMemoryFormat, submissionTimeFormat } from "utils/functions"
import { Submission, SubmitCodePayload } from "utils/types"
import SubmissionResultTag from "shared/components/SubmissionResultTag.vue"
import { isDesktop } from "shared/composables/breakpoints"
import {
  useSubmissionWebSocket,
  type SubmissionUpdate,
} from "shared/composables/websocket"
import { useUserStore } from "shared/store/user"

const ProblemComment = defineAsyncComponent(
  () => import("./ProblemComment.vue"),
)
const userStore = useUserStore()
const route = useRoute()

const contestID = <string>route.params.contestID ?? ""

const submissionId = ref("")
const submission = ref<Submission>()
const [submitted] = useToggle()
const [commentPanel] = useToggle()

const { start: submitPending, isPending } = useTimeout(5000, {
  controls: true,
  immediate: false,
})

const { start: showCommentPanel } = useTimeoutFn(
  async () => {
    const res = await getComment(problem.value!.id)
    if (res.data) return
    commentPanel.value = true
  },
  2000,
  { immediate: false },
)

const { start: fetchSubmission, stop: stopFetchSubmission } = useTimeoutFn(
  async () => {
    const res = await getSubmission(submissionId.value)
    submission.value = res.data
    const result = submission.value.result
    if (
      result === SubmissionStatus.judging ||
      result === SubmissionStatus.pending
    ) {
      fetchSubmission()
    } else {
      submitted.value = false
    }
  },
  2000,
  { immediate: false },
)

// WebSocket 消息处理器
const handleSubmissionUpdate = (data: SubmissionUpdate) => {
  console.log("[Submit] 收到提交更新:", data)
  
  if (data.submission_id !== submissionId.value) {
    console.log(`[Submit] 提交ID不匹配: 期望=${submissionId.value}, 实际=${data.submission_id}`)
    return
  }

  if (!submission.value) {
    submission.value = {} as Submission
  }

  submission.value.result = data.result as Submission["result"]

  // 判题完成，获取完整提交详情
  if (data.status === "finished") {
    console.log("[Submit] 判题完成，获取详细信息")
    getSubmission(submissionId.value).then((res) => {
      submission.value = res.data
      submitted.value = false
      
      // 判题完成后，15 分钟无新提交则断开 WebSocket 连接
      // 考虑到学生换题间隔约 10 分钟，15 分钟可覆盖大部分场景
      scheduleDisconnect(15 * 60 * 1000)
    })
  } else if (data.status === "error") {
    console.log("[Submit] 判题出错")
    submitted.value = false
    // 判题出错后，15 分钟无新提交则断开 WebSocket 连接
    scheduleDisconnect(15 * 60 * 1000)
  }
}

// 初始化 WebSocket（按需连接模式）
const {
  connect,
  subscribe,
  scheduleDisconnect,
  cancelScheduledDisconnect,
  status: wsStatus,
} = useSubmissionWebSocket(handleSubmissionUpdate)

// 组件卸载时停止轮询
onUnmounted(() => {
  stopFetchSubmission()
})

const judging = computed(
  () => submission.value?.result === SubmissionStatus.judging,
)

const pending = computed(
  () => submission.value?.result === SubmissionStatus.pending,
)

const submitting = computed(
  () => submission.value?.result === SubmissionStatus.submitting,
)

const submitDisabled = computed(() => {
  return (
    !userStore.isAuthed ||
    code.value.trim() === "" ||
    judging.value ||
    pending.value ||
    submitting.value ||
    submitted.value ||
    isPending.value
  )
})

const submitLabel = computed(() => {
  if (!userStore.isAuthed) {
    return "请先登录"
  }
  if (submitting.value) {
    return "正在提交"
  }
  if (judging.value || pending.value) {
    return "正在评分"
  }
  if (isPending.value) {
    return "运行结果"
  }
  return "提交代码"
})

const msg = computed(() => {
  if (!submission.value) return ""

  let msg = ""
  const result = submission.value.result

  if (
    result === SubmissionStatus.compile_error ||
    result === SubmissionStatus.runtime_error
  ) {
    msg += "请仔细检查，看看代码的格式是不是写错了！\n\n"
  }

  if (submission.value.statistic_info?.err_info) {
    msg += submission.value.statistic_info.err_info
  }

  return msg
})

const infoTable = computed(() => {
  if (!submission.value?.info?.data?.length) return []

  const result = submission.value.result
  if (
    result === SubmissionStatus.accepted ||
    result === SubmissionStatus.compile_error ||
    result === SubmissionStatus.runtime_error
  ) {
    return []
  }

  const data = submission.value.info.data
  return data.some((item) => item.result === 0) ? data : []
})

const columns: DataTableColumn<Submission["info"]["data"][number]>[] = [
  { title: "测试用例", key: "test_case" },
  {
    title: "测试状态",
    key: "result",
    render: (row) => h(SubmissionResultTag, { result: row.result }),
  },
  {
    title: "占用内存",
    key: "memory",
    render: (row) => submissionMemoryFormat(row.memory),
  },
  {
    title: "执行耗时",
    key: "real_time",
    render: (row) => submissionTimeFormat(row.real_time),
  },
  { title: "信号", key: "signal" },
]

async function submit() {
  if (!userStore.isAuthed) return

  const data: SubmitCodePayload = {
    problem_id: problem.value!.id,
    language: code.language,
    code: code.value,
  }
  if (contestID) {
    data.contest_id = parseInt(contestID)
  }

  submission.value = { result: 9 } as Submission
  const res = await submitCode(data)
  submissionId.value = res.data.submission_id
  console.log(`[Submit] 代码已提交: ID=${submissionId.value}`)
  submitPending()
  submitted.value = true

  // 取消之前安排的断开倒计时（如果有新提交）
  cancelScheduledDisconnect()

  // 按需连接 WebSocket
  if (wsStatus.value !== "connected") {
    console.log(`[Submit] WebSocket 未连接，正在连接... 当前状态: ${wsStatus.value}`)
    connect()
  } else {
    console.log("[Submit] WebSocket 已连接，直接订阅")
  }

  // 优先使用 WebSocket 实时更新
  if (wsStatus.value === "connected" || wsStatus.value === "connecting") {
    // 等待连接完成后订阅
    const checkConnection = setInterval(() => {
      if (wsStatus.value === "connected") {
        clearInterval(checkConnection)
        console.log(`[Submit] 订阅提交更新: ID=${submissionId.value}`)
        subscribe(submissionId.value)
      }
    }, 100)

    // 5 秒后如果还在判题中，降级到轮询作为保险
    // 考虑到判题一般 1-3 秒完成，5 秒足以覆盖绝大部分情况
    setTimeout(() => {
      clearInterval(checkConnection)
      if (
        submission.value &&
        (submission.value.result === SubmissionStatus.judging ||
          submission.value.result === SubmissionStatus.pending ||
          submission.value.result === 9)
      ) {
        console.log("WebSocket 未及时响应，降级到轮询模式")
        fetchSubmission()
      }
    }, 5000)
  } else {
    // WebSocket 连接失败，直接使用轮询
    fetchSubmission()
  }
}

watch(
  () => submission.value?.result,
  (result) => {
    if (result !== SubmissionStatus.accepted) return

    // 刷新题目状态
    problem.value!.my_status = 0
    // 放烟花
    confetti({
      particleCount: 300,
      startVelocity: 30,
      gravity: 0.5,
      spread: 350,
      origin: { x: 0.5, y: 0.4 },
    })
    // 题目在第一次完成之后，弹出点评框
    if (!contestID) showCommentPanel()
  },
)
</script>

<template>
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
            <Icon
              v-if="judging || pending || submitting"
              icon="eos-icons:loading"
            ></Icon>
            <Icon v-else-if="isPending" icon="ph:lightbulb-fill"></Icon>
            <Icon v-else icon="ph:play-fill"></Icon>
          </n-icon>
        </template>
        {{ submitLabel }}
      </n-button>
    </template>
    <template #header>
      <n-alert
        v-if="submission"
        :type="JUDGE_STATUS[submission.result]['type']"
        :title="JUDGE_STATUS[submission.result]['name']"
      />
    </template>
    <n-flex vertical v-if="msg || infoTable.length">
      <n-card v-if="msg" embedded class="msg">{{ msg }}</n-card>
      <n-data-table
        v-if="infoTable.length"
        striped
        :data="infoTable"
        :columns="columns"
      />
    </n-flex>
  </n-popover>
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
<style scoped>
.msg {
  white-space: pre;
  word-break: break-all;
  line-height: 1.5;
}
</style>

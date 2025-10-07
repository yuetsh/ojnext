import { ref, computed, watch, onUnmounted } from "vue"
import { useIntervalFn, useTimeoutFn } from "@vueuse/core"
import { getSubmission } from "oj/api"
import { SubmissionStatus } from "utils/constants"
import type { Submission } from "utils/types"
import {
  useSubmissionWebSocket,
  type SubmissionUpdate,
} from "shared/composables/websocket"

/**
 * 判题监控 Composable
 * 负责通过 WebSocket + 轮询双保险机制监控判题结果
 */
export function useSubmissionMonitor() {
  // ==================== 状态 ====================
  const submissionId = ref("")
  const submission = ref<Submission>()

  // ==================== 轮询机制 ====================
  const { pause: pausePolling, resume: resumePolling } = useIntervalFn(
    async () => {
      if (!submissionId.value) return

      try {
        const res = await getSubmission(submissionId.value)
        submission.value = res.data

        const result = res.data.result
        // 判题完成，停止轮询
        if (
          result !== SubmissionStatus.judging &&
          result !== SubmissionStatus.pending
        ) {
          pausePolling()
        }
      } catch (error) {
        console.error("[SubmissionMonitor] 轮询失败:", error)
        pausePolling()
      }
    },
    2000,
    { immediate: false },
  )

  // ==================== WebSocket 处理 ====================
  const handleSubmissionUpdate = (data: SubmissionUpdate) => {
    console.log("[SubmissionMonitor] 收到WebSocket更新:", data)

    if (data.submission_id !== submissionId.value) {
      console.log("[SubmissionMonitor] 提交ID不匹配，忽略")
      return
    }

    if (!submission.value) {
      submission.value = {} as Submission
    }

    submission.value.result = data.result as Submission["result"]

    // 判题完成或出错，获取完整详情
    if (data.status === "finished" || data.status === "error") {
      console.log(
        `[SubmissionMonitor] 判题${data.status === "finished" ? "完成" : "出错"}`,
      )

      // 停止轮询（WebSocket已成功）
      pausePolling()

      getSubmission(submissionId.value).then((res) => {
        submission.value = res.data
        // 15分钟无新提交则断开WebSocket（节省资源）
        scheduleDisconnect(15 * 60 * 1000)
      })
    }
  }

  // 初始化 WebSocket
  const {
    connect,
    subscribe,
    scheduleDisconnect,
    cancelScheduledDisconnect,
    status: wsStatus,
  } = useSubmissionWebSocket(handleSubmissionUpdate)

  // ==================== 轮询保底启动 ====================
  const { start: startPollingFallback } = useTimeoutFn(
    () => {
      if (
        submission.value &&
        (submission.value.result === SubmissionStatus.judging ||
          submission.value.result === SubmissionStatus.pending ||
          submission.value.result === 9) // 9 = submitting
      ) {
        console.log("[SubmissionMonitor] WebSocket未及时响应，启动轮询保底")
        resumePolling()
      }
    },
    5000,
    { immediate: false },
  )

  // ==================== 启动监控 ====================
  const startMonitoring = (id: string) => {
    submissionId.value = id
    submission.value = { result: 9 } as Submission // 9 = submitting

    // 取消之前的断开计划
    cancelScheduledDisconnect()

    // 如果WebSocket未连接，先连接
    if (wsStatus.value !== "connected") {
      console.log("[SubmissionMonitor] 启动WebSocket连接...")
      connect()
    }

    // 等待WebSocket连接并订阅
    const unwatch = watch(
      wsStatus,
      (status) => {
        if (status === "connected") {
          console.log("[SubmissionMonitor] WebSocket已连接，订阅提交:", id)
          subscribe(id)
          unwatch() // 订阅成功后停止监听
        }
      },
      { immediate: true },
    )

    // 5秒后启动轮询保底（防止WebSocket失败）
    startPollingFallback()
  }

  // ==================== 计算属性 ====================
  const judging = computed(
    () => submission.value?.result === SubmissionStatus.judging,
  )

  const pending = computed(
    () => submission.value?.result === SubmissionStatus.pending,
  )

  const submitting = computed(
    () => submission.value?.result === SubmissionStatus.submitting,
  )

  const isProcessing = computed(() => {
    return judging.value || pending.value || submitting.value
  })

  // ==================== 清理 ====================
  onUnmounted(() => {
    pausePolling()
  })

  return {
    // 状态
    submissionId,
    submission,

    // 计算属性
    judging,
    pending,
    submitting,
    isProcessing,

    // 方法
    startMonitoring,
    pausePolling,
  }
}

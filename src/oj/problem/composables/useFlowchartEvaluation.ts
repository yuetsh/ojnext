import { ref } from "vue"
import { useMessage } from "naive-ui"
import {
  useFlowchartWebSocket,
  type FlowchartEvaluationUpdate,
} from "shared/composables/websocket"

export interface EvaluationResult {
  score?: number
  grade?: string
  feedback?: string
  suggestions?: string
  criteriaDetails?: any
}

export interface SubmissionStatus {
  status: string
  submission_id: string
  created_time?: string
}

export function useFlowchartEvaluation() {
  const message = useMessage()

  const evaluationResult = ref<EvaluationResult | null>(null)
  const submissionStatus = ref<SubmissionStatus | null>(null)
  const loading = ref(false)

  // 处理 WebSocket 消息
  const handleWebSocketMessage = (data: FlowchartEvaluationUpdate) => {
    console.log("收到流程图评分更新:", data)

    if (data.type === "flowchart_evaluation_completed") {
      loading.value = false
      evaluationResult.value = {
        score: data.score,
        grade: data.grade,
        feedback: data.feedback,
      }
      submissionStatus.value = null // 清除状态
      message.success(`流程图评分完成！得分: ${data.score}分 (${data.grade}级)`)
    } else if (data.type === "flowchart_evaluation_failed") {
      console.log("处理评分失败消息")
      loading.value = false
      submissionStatus.value = null // 清除状态
      message.error(`流程图评分失败: ${data.error}`)
    } else {
      console.log("未知的消息类型:", data.type)
    }
  }

  // 创建 WebSocket 连接
  const { connect, disconnect, subscribe } = useFlowchartWebSocket(
    handleWebSocketMessage,
  )

  // 订阅提交更新
  const subscribeToSubmission = (submissionId: string) => {
    console.log("开始订阅WebSocket更新")
    subscribe(submissionId)

    // 设置评分状态显示
    submissionStatus.value = {
      status: "processing",
      submission_id: submissionId,
      created_time: new Date().toISOString(),
    }
  }

  // 清除结果
  const clearResult = () => {
    evaluationResult.value = null
    submissionStatus.value = null
  }

  // 设置加载状态
  const setLoading = (value: boolean) => {
    loading.value = value
  }

  // 设置评估结果
  const setEvaluationResult = (result: EvaluationResult) => {
    evaluationResult.value = result
  }

  return {
    evaluationResult,
    submissionStatus,
    loading,
    connect,
    disconnect,
    subscribeToSubmission,
    clearResult,
    setLoading,
    setEvaluationResult,
  }
}

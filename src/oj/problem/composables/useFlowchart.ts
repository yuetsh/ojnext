import { ref } from "vue"
import { useMessage } from "naive-ui"
import { toRefs } from "vue"
import { submitFlowchart, getCurrentProblemFlowchartSubmission } from "oj/api"
import { useProblemStore } from "oj/store/problem"
import { utoa } from "utils/functions"
import { useMermaidConverter } from "./useMermaidConverter"
import {
  useFlowchartWebSocket,
  type FlowchartEvaluationUpdate,
} from "shared/composables/websocket"

export interface Evaluation {
  score: number
  grade: string
  feedback: string
  suggestions: string
  criteria_details: {
    [key: string]: { score: number; max: number; comment: string }
  }
}

export function useFlowchart() {
  const message = useMessage()
  const problemStore = useProblemStore()
  const { problem } = toRefs(problemStore)

  const { convertToMermaid } = useMermaidConverter()

  // 评估相关状态
  const evaluation = ref<Evaluation | null>(null)
  const loading = ref(false)

  // 提交相关状态
  const submissionCount = ref(0)
  const myFlowchartZippedStr = ref("")
  const myMermaidCode = ref("")

  // 处理 WebSocket 消息
  const handleWebSocketMessage = (data: FlowchartEvaluationUpdate) => {
    console.log("收到流程图评分更新:", data)

    if (data.type === "flowchart_evaluation_completed") {
      loading.value = false
      evaluation.value = {
        score: data.score || 0,
        grade: data.grade || "",
        feedback: data.feedback || "",
        suggestions: data.suggestions || "",
        criteria_details: data.criteria_details || {},
      }
      message.success(`流程图评分完成！得分: ${data.score}分 (${data.grade}级)`)
    } else if (data.type === "flowchart_evaluation_failed") {
      console.log("处理评分失败消息")
      loading.value = false
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
  }

  // 清除结果
  const clearResult = () => {
    evaluation.value = null
  }

  // 设置加载状态
  const setLoading = (value: boolean) => {
    loading.value = value
  }

  // 设置评估结果
  const setEvaluation = (result: Evaluation) => {
    evaluation.value = result
  }

  // 检查当前问题的流程图提交状态
  const checkCurrentSubmissionStatus = async () => {
    if (!problem.value?.id) return

    const { data } = await getCurrentProblemFlowchartSubmission(
      problem.value.id,
    )
    const submission = data.submission
    submissionCount.value = data.count
    if (submission && submission.status === 2) {
      myFlowchartZippedStr.value = data.submission.flowchart_data.data
      myMermaidCode.value = data.submission.mermaid_code
      submissionCount.value += 1
      setEvaluation({
        score: submission.ai_score,
        grade: submission.ai_grade,
        feedback: submission.ai_feedback,
        suggestions: submission.ai_suggestions,
        criteria_details: submission.ai_criteria_details,
      })
    }
  }

  // 提交流程图
  const submitFlowchartData = async (flowchartEditorRef: any) => {
    if (!flowchartEditorRef?.value) return

    // 获取流程图的JSON数据
    const flowchartData = flowchartEditorRef.value.getFlowchartData()

    if (flowchartData.nodes.length === 0 || flowchartData.edges.length === 0) {
      message.error("流程图节点或边不能为空")
      return
    }

    const mermaidCode = convertToMermaid(flowchartData)
    const compressed = utoa(JSON.stringify(flowchartData))

    setLoading(true)
    clearResult() // 清除之前的结果

    try {
      const response = await submitFlowchart({
        problem_id: problem.value!.id,
        mermaid_code: mermaidCode,
        flowchart_data: {
          compressed: true,
          data: compressed,
        },
      })

      // 获取提交ID并订阅更新
      const submissionId = response.data.submission_id

      if (submissionId) {
        subscribeToSubmission(submissionId)
      }

      message.success("流程图已提交，请耐心等待评分")
    } catch (error) {
      setLoading(false)
      message.error("流程图提交失败")
      console.error("提交流程图失败:", error)
    }
  }

  return {
    // 评估相关
    evaluation,
    loading,
    connect,
    disconnect,
    subscribeToSubmission,
    clearResult,
    setLoading,
    setEvaluation,

    // 提交相关
    submissionCount,
    myFlowchartZippedStr,
    myMermaidCode,
    checkCurrentSubmissionStatus,
    submitFlowchartData,
  }
}

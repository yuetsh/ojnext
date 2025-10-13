import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import { submitFlowchart, getCurrentProblemFlowchartSubmission } from 'oj/api'
import { useProblemStore } from 'oj/store/problem'
import { atou, utoa } from 'utils/functions'
import { useMermaidConverter } from './useMermaidConverter'
import { useFlowchartSubmission } from './useFlowchartSubmission'

export function useFlowchartSubmit() {
  const message = useMessage()
  const problemStore = useProblemStore()
  const { problem } = toRefs(problemStore)
  
  const { convertToMermaid } = useMermaidConverter()
  const {
    evaluationResult,
    submissionStatus,
    loading,
    connect,
    disconnect,
    subscribeToSubmission,
    clearResult,
    setLoading,
    setEvaluationResult,
  } = useFlowchartSubmission()

  // 提交次数
  const submissionCount = ref(0)
  
  // 存储流程图数据
  const myFlowchartZippedStr = ref("")

  // 检查当前问题的流程图提交状态
  const checkCurrentSubmissionStatus = async () => {
    if (!problem.value?.id) return

    const { data } = await getCurrentProblemFlowchartSubmission(problem.value.id)
    const submission = data.submission
    submissionCount.value = data.count
    if (submission && submission.status === 2) {
      myFlowchartZippedStr.value = data.submission.flowchart_data.data
      setEvaluationResult({
        score: submission.ai_score,
        grade: submission.ai_grade,
        feedback: submission.ai_feedback,
        suggestions: submission.ai_suggestions,
        criteriaDetails: submission.ai_criteria_details,
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
    evaluationResult,
    submissionStatus,
    loading,
    submissionCount,
    myFlowchartZippedStr,
    connect,
    disconnect,
    checkCurrentSubmissionStatus,
    submitFlowchartData,
  }
}

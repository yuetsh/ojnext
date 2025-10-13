<script lang="ts" setup>
import { useBreakpoints } from "shared/composables/breakpoints"
import { submitFlowchart, getCurrentProblemFlowchartSubmission } from "oj/api"
import { useProblemStore } from "oj/store/problem"
import { utoa } from "utils/functions"
import {
  useFlowchartWebSocket,
  type FlowchartEvaluationUpdate,
} from "shared/composables/websocket"

const loading = ref(false)
const { isDesktop } = useBreakpoints()
const message = useMessage()
const problemStore = useProblemStore()
const { problem } = toRefs(problemStore)

// 通过inject获取FlowchartEditor组件的引用
const flowchartEditorRef = inject<any>("flowchartEditorRef")

const evaluationResult = ref<{
  score?: number
  grade?: string
  feedback?: string
  suggestions?: string
  criteriaDetails?: any
} | null>(null)
const submissionStatus = ref<{
  status: string
  submission_id: string
  created_time?: string
} | null>(null)

// 弹框状态
const showDetailModal = ref(false)

// 提交次数
const submissionCount = ref(0)

// 处理 WebSocket 消息
const handleWebSocketMessage = (data: FlowchartEvaluationUpdate) => {
  console.log("收到流程图评分更新:", data)

  if (data.type === "flowchart_evaluation_completed") {
    console.log("处理评分完成消息")
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
const { connect, disconnect, subscribe, status } = useFlowchartWebSocket(
  handleWebSocketMessage,
)

// 监听WebSocket状态变化
watch(
  status,
  (newStatus) => {
    console.log("WebSocket状态变化:", newStatus)
  },
  { immediate: true },
)

// 检查当前问题的流程图提交状态
const checkCurrentSubmissionStatus = async () => {
  if (!problem.value?.id) return

  const { data } = await getCurrentProblemFlowchartSubmission(problem.value.id)
  const submission = data.submission
  submissionCount.value = data.count
  if (submission && submission.status === 2) {
    evaluationResult.value = {
      score: submission.ai_score,
      grade: submission.ai_grade,
      feedback: submission.ai_feedback,
      suggestions: submission.ai_suggestions,
      criteriaDetails: submission.ai_criteria_details,
    }
  }
}

// 组件挂载时连接 WebSocket 并检查状态
onMounted(() => {
  connect()
  checkCurrentSubmissionStatus()
})

// 组件卸载时断开连接
onUnmounted(() => {
  disconnect()
})

// 将流程图JSON数据转换为Mermaid格式
const convertToMermaid = (flowchartData: any) => {
  const { nodes, edges } = flowchartData

  if (!nodes || nodes.length === 0) {
    return "graph TD\n    A[空流程图]"
  }

  let mermaid = "graph TD\n"

  // 处理节点 - 根据原始类型和自定义标签
  nodes.forEach((node: any) => {
    const nodeId = node.id
    const label = node.data?.customLabel || node.data?.label || "节点"
    const originalType = node.data?.originalType || node.type

    // 根据节点原始类型确定Mermaid语法
    switch (originalType) {
      case "start":
        mermaid += `    ${nodeId}((${label}))\n`
        break
      case "end":
        mermaid += `    ${nodeId}((${label}))\n`
        break
      case "input":
        // 输入框使用平行四边形
        mermaid += `    ${nodeId}[/${label}/]\n`
        break
      case "output":
        // 输出框使用平行四边形
        mermaid += `    ${nodeId}[/${label}/]\n`
        break
      case "default":
        mermaid += `    ${nodeId}[${label}]\n`
        break
      case "decision":
        mermaid += `    ${nodeId}{${label}}\n`
        break
      case "loop":
        // 循环使用菱形
        mermaid += `    ${nodeId}{${label}}\n`
        break
      default:
        mermaid += `    ${nodeId}[${label}]\n`
    }
  })

  // 处理边
  edges.forEach((edge: any) => {
    const source = edge.source
    const target = edge.target
    const label = edge.label ?? ""

    if (label && label.trim() !== "") {
      mermaid += `    ${source} -->|${label}| ${target}\n`
    } else {
      mermaid += `    ${source} --> ${target}\n`
    }
  })

  // 添加样式定义来区分不同类型的节点
  mermaid += "\n"
  mermaid +=
    "    classDef startEnd fill:#e1f5fe,stroke:#01579b,stroke-width:2px\n"
  mermaid += "    classDef input fill:#e3f2fd,stroke:#1976d2,stroke-width:2px\n"
  mermaid +=
    "    classDef output fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px\n"
  mermaid +=
    "    classDef process fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px\n"
  mermaid +=
    "    classDef decision fill:#fff3e0,stroke:#e65100,stroke-width:2px\n"
  mermaid += "\n"

  // 为节点应用样式
  nodes.forEach((node: any) => {
    const nodeId = node.id
    const originalType = node.data?.originalType || node.type

    switch (originalType) {
      case "start":
      case "end":
        mermaid += `    class ${nodeId} startEnd\n`
        break
      case "input":
        mermaid += `    class ${nodeId} input\n`
        break
      case "output":
        mermaid += `    class ${nodeId} output\n`
        break
      case "decision":
      case "loop":
        mermaid += `    class ${nodeId} decision\n`
        break
      default:
        mermaid += `    class ${nodeId} process\n`
    }
  })

  return mermaid
}

async function submit() {
  if (!flowchartEditorRef?.value) return
  // 获取流程图的JSON数据
  const flowchartData = flowchartEditorRef.value.getFlowchartData()

  if (flowchartData.nodes.length === 0 || flowchartData.edges.length === 0) {
    message.error("流程图节点或边不能为空")
    return
  }
  const mermaidCode = convertToMermaid(flowchartData)
  const compressed = utoa(JSON.stringify(flowchartData))

  loading.value = true
  evaluationResult.value = null // 清除之前的结果

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
      console.log("开始订阅WebSocket更新")
      subscribe(submissionId)

      // 设置评分状态显示
      submissionStatus.value = {
        status: "processing",
        submission_id: submissionId,
        created_time: new Date().toISOString(),
      }
    }

    message.success("流程图已提交，请耐心等待评分")
  } catch (error) {
    loading.value = false
    message.error("流程图提交失败")
    console.error("提交流程图失败:", error)
  }
}

// 根据分数获取标签类型
const getScoreType = (score: number) => {
  if (score >= 90) return "success"
  if (score >= 80) return "info"
  if (score >= 70) return "warning"
  return "error"
}

// 根据等级获取标签类型
const getGradeType = (grade: string) => {
  switch (grade) {
    case "S":
      return "success"
    case "A":
      return "info"
    case "B":
      return "warning"
    case "C":
      return "error"
    default:
      return "default"
  }
}

// 格式化时间
const formatTime = (timeString: string) => {
  const date = new Date(timeString)
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}
</script>

<template>
  <n-flex align="center">
    <n-button
      :size="isDesktop ? 'medium' : 'small'"
      type="primary"
      :loading="loading"
      :disabled="loading"
      @click="submit"
    >
      {{ loading ? "评分中..." : "提交流程图" }}
    </n-button>
    <!-- 显示提交次数 -->
    <n-button secondary v-if="submissionCount > 0" type="info">
      {{ submissionCount }} 次
    </n-button>

    <!-- 评分结果显示 -->
    <n-button
      secondary
      v-if="evaluationResult"
      @click="showDetailModal = true"
      :type="getScoreType(evaluationResult.score!)"
    >
      {{ evaluationResult.score }}分 {{ evaluationResult.grade }}级
    </n-button>

    <!-- 详情弹框 -->
    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      title="评分详情"
      style="width: 500px"
    >
      <!-- 反馈部分 -->
      <n-card
        v-if="evaluationResult?.feedback"
        size="small"
        title="AI反馈"
        style="margin-bottom: 16px"
      >
        <n-text>{{ evaluationResult.feedback }}</n-text>
      </n-card>

      <!-- 建议部分 -->
      <n-card
        v-if="evaluationResult?.suggestions"
        size="small"
        title="改进建议"
        style="margin-bottom: 16px"
      >
        <n-text>{{ evaluationResult.suggestions }}</n-text>
      </n-card>

      <!-- 详细评分部分 -->
      <n-card
        v-if="evaluationResult?.criteriaDetails"
        size="small"
        title="详细评分"
      >
        <div
          v-for="(detail, key) in evaluationResult.criteriaDetails"
          :key="key"
          style="margin-bottom: 12px"
        >
          <n-flex
            justify="space-between"
            align="center"
            style="margin-bottom: 4px"
          >
            <n-text strong>{{ key }}</n-text>
            <n-tag :type="getScoreType(detail.score || 0)" size="small" round>
              {{ detail.score || 0 }}分 / {{ detail.max }}分
            </n-tag>
          </n-flex>
          <n-text v-if="detail.comment" depth="3" style="font-size: 12px">
            {{ detail.comment }}
          </n-text>
        </div>
      </n-card>
    </n-modal>
  </n-flex>
</template>

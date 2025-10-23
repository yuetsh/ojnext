<script lang="ts" setup>
import { toRefs } from "vue"

// 工具函数
import { atou, utoa } from "utils/functions"

// 组合式函数
import { useBreakpoints } from "shared/composables/breakpoints"
import { useMermaid } from "shared/composables/useMermaid"
import { useMermaidConverter } from "../composables/useMermaidConverter"
import {
  useFlowchartWebSocket,
  type FlowchartEvaluationUpdate,
} from "shared/composables/websocket"

// API 和状态管理
import { getCurrentProblemFlowchartSubmission, submitFlowchart, updateProblemSetProgress } from "oj/api"
import { useProblemStore } from "oj/store/problem"

// ==================== 类型定义 ====================
interface Rating {
  score: number
  grade: string
}

interface Evaluation extends Rating {
  feedback: string
  suggestions: string
  criteria_details: {
    [key: string]: { score: number; max: number; comment: string }
  }
}

// ==================== 组合式函数和响应式变量 ====================
// 通过inject获取FlowchartEditor组件的引用
const flowchartEditorRef = inject<any>("flowchartEditorRef")
const mermaidContainer = useTemplateRef<HTMLElement>("mermaidContainer")

// 基础组合式函数
const message = useMessage()
const problemStore = useProblemStore()
const { problem } = toRefs(problemStore)
const { isDesktop } = useBreakpoints()
const { convertToMermaid } = useMermaidConverter()
const { renderError, renderFlowchart } = useMermaid()
const route = useRoute()

// 状态管理
const rendering = ref(false)
const loading = ref(false)
const rating = ref<Rating>({ score: 0, grade: "" })
const submissionCount = ref(0)
const myFlowchartZippedStr = ref("")
const myMermaidCode = ref("")
const showDetailModal = ref(false)
const evaluation = ref<Evaluation>({
  score: 0,
  grade: "",
  feedback: "",
  suggestions: "",
  criteria_details: {},
})

// ==================== WebSocket 相关函数 ====================
// 处理 WebSocket 消息
const handleWebSocketMessage = (data: FlowchartEvaluationUpdate) => {
  console.log("收到流程图评分更新:", data)

  if (data.type === "flowchart_evaluation_completed") {
    loading.value = false
    rating.value = {
      score: data.score || 0,
      grade: data.grade || "",
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
function subscribeToSubmission(submissionId: string) {
  console.log("开始订阅WebSocket更新")
  subscribe(submissionId)
}

// ==================== 提交相关函数 ====================
// 提交流程图
async function submitFlowchartData(flowchartEditorRef: any) {
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
  rating.value = { score: 0, grade: "" }

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
    loading.value = false
    message.error("流程图提交失败")
    console.error("提交流程图失败:", error)
  }
}

// 提交函数
function submit() {
  submitFlowchartData(flowchartEditorRef)
}

// ==================== 数据获取和处理函数 ====================
async function getSubmission() {
  if (!problem.value?.id) return
  const { data } = await getCurrentProblemFlowchartSubmission(problem.value.id)
  submissionCount.value = data.count
  const submission = data.submission
  myMermaidCode.value = submission.mermaid_code
  myFlowchartZippedStr.value = submission.flowchart_data.data
  if (submission && submission.status === 2) {
    rating.value = {
      score: submission.ai_score,
      grade: submission.ai_grade,
    }
    evaluation.value = {
      score: submission.ai_score,
      grade: submission.ai_grade,
      feedback: submission.ai_feedback,
      suggestions: submission.ai_suggestions,
      criteria_details: submission.ai_criteria_details,
    }
  }
}

// ==================== 模态框相关函数 ====================
async function openDetailModal() {
  rendering.value = true
  showDetailModal.value = true
  await getSubmission()
  await renderFlowchart(mermaidContainer.value, myMermaidCode.value)
  rendering.value = false
}

function closeModal() {
  showDetailModal.value = false
}

function loadToEditor() {
  if (myFlowchartZippedStr.value) {
    const str = atou(myFlowchartZippedStr.value)
    const json = JSON.parse(str)
    const processedData = {
      nodes: json.nodes || [],
      edges: json.edges || [],
    }
    if (flowchartEditorRef?.value) {
      flowchartEditorRef.value.setFlowchartData(processedData)
    }
  }
  closeModal()
}

// ==================== 工具函数 ====================
const getGradeType = (grade: string) => {
  if (grade === "S") return "primary"
  if (grade === "A") return "info"
  if (grade === "B") return "warning"
  return "error"
}

const getPercentType = (percent: number) => {
  if (percent >= 0.8) return "primary"
  else if (percent >= 0.6) return "info"
  else if (percent >= 0.4) return "warning"
  return "error"
}

// ==================== 生命周期钩子 ====================
// 组件挂载时连接 WebSocket 并检查状态
onMounted(() => {
  connect()
  getSubmission()
})

// 组件卸载时断开连接
onUnmounted(() => {
  disconnect()
})
</script>

<template>
  <!-- 主要操作区域 -->
  <n-flex align="center">
    <!-- 提交按钮 -->
    <n-button
      :size="isDesktop ? 'medium' : 'small'"
      type="primary"
      :loading="loading"
      :disabled="loading"
      @click="submit"
    >
      {{ loading ? "AI 点评中..." : "提交流程图" }}
    </n-button>

    <!-- 提交次数显示 -->
    <n-button secondary v-if="submissionCount > 0" type="info">
      {{ submissionCount }} 次
    </n-button>

    <!-- 评分结果按钮 -->
    <n-button
      secondary
      v-if="rating.grade"
      @click="openDetailModal"
      :type="getGradeType(rating.grade)"
    >
      {{ rating.score }}分 {{ rating.grade }}级
    </n-button>

    <!-- 评分详情模态框 -->
    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      title="评分详情"
      style="width: 1000px"
    >
      <n-grid :cols="5" :x-gap="16">
        <!-- 左侧：流程图预览区域 -->
        <n-gi :span="3">
          <n-card title="流程图预览">
            <div class="flowchart">
              <n-spin v-if="rendering" />
              <!-- 错误提示 -->
              <n-alert v-if="renderError" type="error" title="流程图渲染失败">
                <template #default>
                  {{ renderError }}
                </template>
              </n-alert>
              <!-- 流程图容器 -->
              <div class="flowchart" v-else ref="mermaidContainer"></div>
            </div>
          </n-card>
          <!-- 加载到编辑器按钮 -->
          <n-flex style="margin-top: 16px" justify="center">
            <n-button @click="loadToEditor" type="primary">
              加载到流程图编辑器
            </n-button>
          </n-flex>
        </n-gi>

        <!-- 右侧：评分详情区域 -->
        <n-gi :span="2">
          <!-- AI反馈 -->
          <n-card
            v-if="evaluation.feedback"
            size="small"
            title="AI反馈"
            style="margin-bottom: 16px"
          >
            <n-text>{{ evaluation.feedback }}</n-text>
          </n-card>

          <!-- 改进建议 -->
          <n-card
            v-if="evaluation.suggestions"
            size="small"
            title="改进建议"
            style="margin-bottom: 16px"
          >
            <n-text>{{ evaluation.suggestions }}</n-text>
          </n-card>

          <!-- 详细评分 -->
          <n-card
            v-if="evaluation.criteria_details"
            size="small"
            title="详细评分"
          >
            <div
              v-for="(detail, key) in evaluation.criteria_details"
              :key="key"
              style="margin-bottom: 12px"
            >
              <!-- 评分项标题和分数 -->
              <n-flex
                justify="space-between"
                align="center"
                style="margin-bottom: 4px"
              >
                <n-text strong>{{ key }}</n-text>
                <n-tag
                  :type="getPercentType(detail.score / detail.max)"
                  size="small"
                  round
                >
                  {{ detail.score || 0 }}分 / {{ detail.max }}分
                </n-tag>
              </n-flex>
              <!-- 评分项详细说明 -->
              <n-text v-if="detail.comment" depth="3" style="font-size: 12px">
                {{ detail.comment }}
              </n-text>
            </div>
          </n-card>
        </n-gi>
      </n-grid>
    </n-modal>
  </n-flex>
</template>
<style scoped>
/* ==================== 流程图样式 ==================== */
.flowchart {
  height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 确保 SVG 图表占满容器 */
:deep(.flowchart > svg) {
  height: 100%;
}
</style>

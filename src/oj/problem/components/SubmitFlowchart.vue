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
import { usePinnedFlowchartStore } from "shared/store/pinnedFlowchart"

// API 和状态管理
import {
  getCurrentProblemFlowchartSubmission,
  getFlowchartSubmissionDetail,
  submitFlowchart,
} from "oj/api"
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
interface FlowchartEditorInstance {
  getFlowchartData: () => { nodes: unknown[]; edges: unknown[] }
  setFlowchartData: (data: { nodes: unknown[]; edges: unknown[] }) => void
}

// 通过inject获取FlowchartEditor组件的引用
const flowchartEditorRef =
  inject<Ref<FlowchartEditorInstance | null>>("flowchartEditorRef")
const mermaidContainer = useTemplateRef<HTMLElement>("mermaidContainer")

// 基础组合式函数
const message = useMessage()
const problemStore = useProblemStore()
const { problem } = toRefs(problemStore)
const { isDesktop } = useBreakpoints()
const pinnedStore = usePinnedFlowchartStore()
const { convertToMermaid } = useMermaidConverter()
const { renderError, renderFlowchart } = useMermaid()

// 状态管理
const rendering = ref(false)
const loading = ref(false)
const latestRating = ref<Rating>({ score: 0, grade: "" })
const modalRating = ref<Rating>({ score: 0, grade: "" })
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
const page = ref(1)
const lastSubmittedMermaidCode = ref("")
const suggestionLines = computed(() =>
  splitSuggestionLines(evaluation.value.suggestions),
)

function splitSuggestionLines(suggestions?: string | null) {
  return suggestions
    ? suggestions
        .split("\n")
        .map((suggestion) => suggestion.trim())
        .filter(Boolean)
    : []
}

// ==================== WebSocket 相关函数 ====================
const handleWebSocketMessage = (data: FlowchartEvaluationUpdate) => {
  if (data.type === "flowchart_evaluation_completed") {
    loading.value = false
    const grade = data.grade || ""
    latestRating.value = { score: data.score || 0, grade }
    message.success(`流程图评分完成！得分: ${data.score}分 (${grade}级)`)
    if ((grade === "A" || grade === "S") && lastSubmittedMermaidCode.value) {
      pinnedStore.pin(lastSubmittedMermaidCode.value)
    }
  } else if (data.type === "flowchart_evaluation_failed") {
    loading.value = false
    message.error(`流程图评分失败: ${data.error}`)
  }
}

// 创建 WebSocket 连接
const { connect, disconnect, subscribe } = useFlowchartWebSocket(
  handleWebSocketMessage,
)

// 订阅提交更新
function subscribeToSubmission(submissionId: string) {
  subscribe(submissionId)
}

// ==================== 提交相关函数 ====================
// 提交流程图
async function submitFlowchartData() {
  if (!flowchartEditorRef?.value) return

  // 获取流程图的JSON数据
  const flowchartData = flowchartEditorRef.value.getFlowchartData()

  if (!flowchartData?.nodes?.length || !flowchartData?.edges?.length) {
    message.error("流程图节点或边不能为空")
    return
  }

  const mermaidCode = convertToMermaid(flowchartData)
  lastSubmittedMermaidCode.value = mermaidCode
  const compressed = utoa(JSON.stringify(flowchartData))

  loading.value = true
  latestRating.value = { score: 0, grade: "" }

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
  submitFlowchartData()
}

// ==================== 数据获取和处理函数 ====================

async function getCurrentSubmission() {
  if (!problem.value?.id) return
  const { data } = await getCurrentProblemFlowchartSubmission(problem.value.id)
  submissionCount.value = data.count
  latestRating.value = {
    score: data.score,
    grade: data.grade,
  }
}

async function getSubmission(submissionPage = 0) {
  if (!problem.value?.id) return
  const { data } = await getFlowchartSubmissionDetail(
    problem.value.id,
    submissionPage,
  )
  submissionCount.value = data.count
  const submission = data.submission
  myFlowchartZippedStr.value = submission.flowchart_data.data
  myMermaidCode.value = submission.mermaid_code || ""
  modalRating.value = {
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

async function updatePage(val: number) {
  page.value = val
  rendering.value = true
  await getSubmission(val)
  // 等待 DOM 更新
  await nextTick()
  await renderFlowchart(mermaidContainer.value, myMermaidCode.value)
  rendering.value = false
}

// ==================== 模态框相关函数 ====================
async function openDetailModal() {
  showDetailModal.value = true
  rendering.value = true
  await getSubmission()
  page.value = submissionCount.value
  // 等待 DOM 更新，确保弹框已经渲染
  await nextTick()
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
onMounted(async () => {
  connect()
  await getCurrentSubmission()
  page.value = submissionCount.value
  const grade = latestRating.value.grade
  if ((grade === "A" || grade === "S") && submissionCount.value > 0) {
    await getSubmission(submissionCount.value)
    if (myMermaidCode.value) {
      pinnedStore.pin(myMermaidCode.value)
    }
  }
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

    <!-- 评分结果按钮 -->
    <n-button
      secondary
      v-if="latestRating.grade"
      @click="openDetailModal"
      :type="getGradeType(latestRating.grade)"
    >
      {{ latestRating.score }}分 {{ latestRating.grade }}级
    </n-button>

    <!-- 流程图评分详情模态框 -->
    <n-modal v-model:show="showDetailModal" preset="card" style="width: 1000px">
      <template #header>
        <n-flex align="center">
          <n-text>流程图评分详情</n-text>
          <n-text :type="getGradeType(modalRating.grade)">
            {{ modalRating.score }}分 {{ modalRating.grade }}级
          </n-text>
        </n-flex>
      </template>
      <n-grid :cols="5" :x-gap="16">
        <!-- 左侧：流程图预览区域 -->
        <n-gi :span="3">
          <div class="flowchart">
            <n-spin :show="rendering">
              <n-alert v-if="renderError" type="error" title="流程图渲染失败">
                {{ renderError }}
              </n-alert>
              <div class="flowchart" v-else ref="mermaidContainer"></div>
            </n-spin>
          </div>
          <!-- 加载到编辑器按钮 -->
          <n-flex style="margin-top: 16px" justify="center">
            <n-button @click="loadToEditor" type="primary">
              加载到流程图编辑器
            </n-button>
          </n-flex>
        </n-gi>

        <!-- 右侧：评分详情区域 -->
        <n-gi :span="2" style="max-height: 550px; overflow: auto">
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
            v-if="suggestionLines.length"
            size="small"
            title="改进建议"
            style="margin-bottom: 16px"
          >
            <n-flex vertical :size="6">
              <n-text
                v-for="(suggestion, index) in suggestionLines"
                :key="`${index}-${suggestion}`"
              >
                {{ suggestion }}
              </n-text>
            </n-flex>
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

      <!-- 分页组件 -->
      <n-flex
        justify="center"
        style="margin-top: 24px"
        v-if="submissionCount > 1"
      >
        <n-pagination
          v-model:page="page"
          :page-count="submissionCount"
          @update-page="updatePage"
        />
      </n-flex>
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

<template>
  <div class="flowchart-submission-detail">
    <div class="detail-header">
      <h2>流程图提交详情</h2>
      <n-space>
        <n-button @click="refreshDetail" :loading="loading">
          <Icon icon="mdi:refresh" />
          刷新
        </n-button>
        <n-button
          v-if="submission?.status === FlowchartSubmissionStatus.FAILED"
          type="warning"
          @click="retrySubmission"
        >
          <Icon icon="mdi:restart" />
          重试评分
        </n-button>
      </n-space>
    </div>

    <div v-if="loading" class="loading-container">
      <n-spin size="large" />
    </div>

    <div v-else-if="submission" class="detail-content">
      <!-- 基本信息 -->
      <n-card title="基本信息" class="info-card">
        <n-descriptions :column="2" bordered>
          <n-descriptions-item label="提交ID">
            {{ submission.id }}
          </n-descriptions-item>
          <n-descriptions-item label="用户ID">
            {{ submission.user }}
          </n-descriptions-item>
          <n-descriptions-item label="题目ID">
            {{ submission.problem }}
          </n-descriptions-item>
          <n-descriptions-item label="状态">
            <n-tag :type="getStatusType(submission.status)">
              {{ getStatusText(submission.status) }}
            </n-tag>
          </n-descriptions-item>
          <n-descriptions-item label="提交时间">
            {{ formatTime(submission.create_time) }}
          </n-descriptions-item>
          <n-descriptions-item
            label="评分时间"
            v-if="submission.evaluation_time"
          >
            {{ formatTime(submission.evaluation_time) }}
          </n-descriptions-item>
        </n-descriptions>
      </n-card>

      <!-- AI评分结果 -->
      <n-card
        v-if="submission.status === FlowchartSubmissionStatus.COMPLETED"
        title="AI评分结果"
        class="score-card"
      >
        <div class="score-content">
          <div class="score-main">
            <div class="score-value">
              <span class="score-number">{{
                submission.ai_score?.toFixed(1) || 0
              }}</span>
              <span class="score-unit">分</span>
            </div>
            <div class="score-grade">
              <n-tag :type="getGradeType(submission.ai_grade)" size="large">
                {{ submission.ai_grade || "N/A" }}
              </n-tag>
            </div>
          </div>

          <div class="score-details">
            <n-descriptions :column="1" size="small">
              <n-descriptions-item label="AI提供商">
                {{ submission.ai_provider || "deepseek" }}
              </n-descriptions-item>
              <n-descriptions-item label="AI模型">
                {{ submission.ai_model || "deepseek-chat" }}
              </n-descriptions-item>
              <n-descriptions-item
                label="处理时间"
                v-if="submission.processing_time"
              >
                {{ submission.processing_time.toFixed(2) }}秒
              </n-descriptions-item>
            </n-descriptions>
          </div>
        </div>
      </n-card>

      <!-- AI反馈 -->
      <n-card
        v-if="submission.ai_feedback"
        title="AI反馈"
        class="feedback-card"
      >
        <div class="feedback-content">
          <p>{{ submission.ai_feedback }}</p>
        </div>
      </n-card>

      <!-- AI建议 -->
      <n-card
        v-if="submission.ai_suggestions"
        title="AI建议"
        class="suggestions-card"
      >
        <div class="suggestions-content">
          <p>{{ submission.ai_suggestions }}</p>
        </div>
      </n-card>

      <!-- 详细评分标准 -->
      <n-card
        v-if="
          submission.ai_criteria_details &&
          Object.keys(submission.ai_criteria_details).length > 0
        "
        title="详细评分标准"
        class="criteria-card"
      >
        <div class="criteria-content">
          <n-collapse>
            <n-collapse-item
              v-for="(detail, key) in submission.ai_criteria_details"
              :key="key"
              :title="key"
              :name="key"
            >
              <div class="criteria-detail">
                <pre>{{ JSON.stringify(detail, null, 2) }}</pre>
              </div>
            </n-collapse-item>
          </n-collapse>
        </div>
      </n-card>

      <!-- 流程图预览 -->
      <n-card title="流程图预览" class="flowchart-card">
        <div class="flowchart-preview">
          <div class="mermaid-container" ref="mermaidContainer"></div>
        </div>
      </n-card>

      <!-- Mermaid代码 -->
      <n-card title="Mermaid代码" class="code-card">
        <div class="code-content">
          <n-input
            v-model:value="mermaidCode"
            type="textarea"
            :rows="10"
            readonly
            placeholder="Mermaid代码将在这里显示"
          />
          <div class="code-actions">
            <n-space>
              <n-button @click="copyCode">
                <Icon icon="mdi:content-copy" />
                复制代码
              </n-button>
              <n-button @click="downloadCode">
                <Icon icon="mdi:download" />
                下载文件
              </n-button>
            </n-space>
          </div>
        </div>
      </n-card>
    </div>

    <div v-else class="error-container">
      <n-result status="error" title="加载失败" description="无法加载提交详情">
        <template #footer>
          <n-button @click="refreshDetail">重试</n-button>
        </template>
      </n-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from "vue"
import { useRoute } from "vue-router"
import {
  NCard,
  NButton,
  NSpace,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NInput,
  NCollapse,
  NCollapseItem,
  NSpin,
  NResult,
  useMessage,
} from "naive-ui"
import { Icon } from "@iconify/vue"
import { getFlowchartSubmission, retryFlowchartSubmission } from "../api"
import { FlowchartSubmission, FlowchartSubmissionStatus } from "utils/types"
import mermaid from "mermaid"

const route = useRoute()

const submissionId = computed(() => route.params.id as string)

// 响应式数据
const loading = ref(false)
const submission = ref<FlowchartSubmission | null>(null)
const mermaidCode = ref("")
const mermaidContainer = ref<HTMLElement | null>(null)

const message = useMessage()

// 方法
const loadSubmission = async () => {
  loading.value = true
  try {
    const response = await getFlowchartSubmission(submissionId.value)
    submission.value = response.data

    // 设置 Mermaid 代码
    if (submission.value) {
      mermaidCode.value = submission.value.mermaid_code

      // 渲染 Mermaid 图表
      await nextTick()
      if (mermaidContainer.value && submission.value.mermaid_code) {
        mermaidContainer.value.innerHTML = ""
        mermaid
          .render("detail-mermaid", submission.value.mermaid_code)
          .then(({ svg }) => {
            if (mermaidContainer.value) {
              mermaidContainer.value.innerHTML = svg
            }
          })
      }
    }
  } catch (error: any) {
    console.error("加载提交详情失败:", error)
    message.error("加载提交详情失败")
  } finally {
    loading.value = false
  }
}

const refreshDetail = () => {
  loadSubmission()
}

const retrySubmission = async () => {
  if (!submission.value) return

  try {
    await retryFlowchartSubmission(submission.value.id)
    message.success("重试请求已发送")
    loadSubmission()
  } catch (error: any) {
    console.error("重试失败:", error)
    message.error("重试失败")
  }
}

const getStatusType = (status: number) => {
  const statusMap: Record<
    number,
    "default" | "primary" | "success" | "info" | "warning" | "error"
  > = {
    [FlowchartSubmissionStatus.PENDING]: "warning",
    [FlowchartSubmissionStatus.PROCESSING]: "info",
    [FlowchartSubmissionStatus.COMPLETED]: "success",
    [FlowchartSubmissionStatus.FAILED]: "error",
  }
  return statusMap[status] || "default"
}

const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    [FlowchartSubmissionStatus.PENDING]: "等待评分",
    [FlowchartSubmissionStatus.PROCESSING]: "评分中",
    [FlowchartSubmissionStatus.COMPLETED]: "评分完成",
    [FlowchartSubmissionStatus.FAILED]: "评分失败",
  }
  return statusMap[status] || "未知"
}

const getGradeType = (grade: string | undefined) => {
  if (!grade) return "default"
  const gradeMap: Record<
    string,
    "default" | "primary" | "success" | "info" | "warning" | "error"
  > = {
    S: "success",
    A: "info",
    B: "warning",
    C: "error",
  }
  return gradeMap[grade] || "default"
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleString()
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(mermaidCode.value)
    message.success("代码已复制到剪贴板")
  } catch (err) {
    message.error("复制失败")
  }
}

const downloadCode = () => {
  const blob = new Blob([mermaidCode.value], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `flowchart-${submissionId.value}.mmd`
  a.click()
  URL.revokeObjectURL(url)
  message.success("文件下载成功")
}

// 生命周期
onMounted(() => {
  loadSubmission()
})
</script>

<style scoped>
.flowchart-submission-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.detail-header h2 {
  margin: 0;
  color: #333;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card,
.score-card,
.feedback-card,
.suggestions-card,
.criteria-card,
.flowchart-card,
.code-card {
  border-radius: 8px;
}

.score-content {
  display: flex;
  gap: 30px;
  align-items: center;
}

.score-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.score-value {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.score-number {
  font-size: 48px;
  font-weight: bold;
  color: #1890ff;
}

.score-unit {
  font-size: 18px;
  color: #666;
}

.score-grade {
  font-size: 24px;
}

.score-details {
  flex: 1;
}

.feedback-content,
.suggestions-content {
  padding: 15px;
  background: #f5f5f5;
  border-radius: 6px;
  line-height: 1.6;
}

.criteria-content {
  max-height: 400px;
  overflow-y: auto;
}

.criteria-detail {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-family: "Courier New", monospace;
  font-size: 12px;
  overflow-x: auto;
}

.flowchart-preview {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: #fafafa;
  border-radius: 6px;
}

.mermaid-container {
  max-width: 100%;
  overflow: auto;
}

.code-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.code-actions {
  display: flex;
  justify-content: flex-end;
}

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}
</style>

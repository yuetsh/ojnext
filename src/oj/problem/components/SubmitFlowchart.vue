<script lang="ts" setup>
import { useBreakpoints } from "shared/composables/breakpoints"
import { useFlowchartSubmission } from "../composables/useFlowchartSubmission"
import FlowchartEvaluationDisplay from "./FlowchartEvaluationDisplay.vue"

const { isDesktop } = useBreakpoints()

// 通过inject获取FlowchartEditor组件的引用
const flowchartEditorRef = inject<any>("flowchartEditorRef")

// 使用拆分后的逻辑
const {
  evaluationResult,
  loading,
  submissionCount,
  myFlowchartZippedStr,
  myMermaidCode,
  connect,
  disconnect,
  checkCurrentSubmissionStatus,
  submitFlowchartData,
} = useFlowchartSubmission()

// 组件挂载时连接 WebSocket 并检查状态
onMounted(() => {
  connect()
  checkCurrentSubmissionStatus()
})

// 组件卸载时断开连接
onUnmounted(() => {
  disconnect()
})

// 提交函数
async function submit() {
  await submitFlowchartData(flowchartEditorRef)
}

// 处理加载到编辑器
function handleLoadToEditor(data: any) {
  if (flowchartEditorRef?.value) {
    flowchartEditorRef.value.setFlowchartData(data)
  }
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

    <!-- 评分结果显示组件 -->
    <FlowchartEvaluationDisplay
      :evaluation-result="evaluationResult"
      :my-flowchart-zipped-str="myFlowchartZippedStr"
      :my-mermaid-code="myMermaidCode"
      @close="() => {}"
      @load-to-editor="handleLoadToEditor"
    />
  </n-flex>
</template>

<template>
  <n-grid v-if="submission" :cols="5" :x-gap="16">
    <!-- 左侧：流程图预览区域 -->
    <n-gi :span="showLargeImage ? 5 : 3">
      <n-card title="流程图预览">
        <template #header-extra>
          <n-button
            v-if="!renderError && submission?.mermaid_code"
            quaternary
            size="small"
            @click="showLargeImage = !showLargeImage"
          >
            <template #icon>
              <Icon
                :icon="
                  showLargeImage ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'
                "
              />
            </template>
            {{ showLargeImage ? "退出大图" : "查看大图" }}
          </n-button>
        </template>
        <div class="flowchart">
          <n-alert v-if="renderError" type="error" title="流程图渲染失败">
            {{ renderError }}
          </n-alert>
          <div class="flowchart" v-else ref="mermaidContainer"></div>
        </div>
      </n-card>
    </n-gi>

    <!-- 右侧：评分详情区域 -->
    <n-gi v-if="!showLargeImage" :span="2">
      <!-- AI反馈 -->
      <n-card
        v-if="submission.ai_feedback"
        size="small"
        title="AI反馈"
        style="margin-bottom: 16px"
      >
        <n-text>{{ submission.ai_feedback }}</n-text>
      </n-card>

      <!-- 改进建议 -->
      <n-card
        v-if="submission.ai_suggestions"
        size="small"
        title="改进建议"
        style="margin-bottom: 16px"
      >
        <n-text>{{ submission.ai_suggestions }}</n-text>
      </n-card>

      <!-- 详细评分 -->
      <n-card
        v-if="
          submission.ai_criteria_details &&
          Object.keys(submission.ai_criteria_details).length > 0
        "
        size="small"
        title="详细评分"
      >
        <div
          v-for="(detail, key) in submission.ai_criteria_details"
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
  <n-spin v-else :show="loading" class="loading-container"> </n-spin>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { FlowchartSubmission } from "utils/types"
import { useMermaid } from "shared/composables/useMermaid"

interface Props {
  submissionId: string
}

const props = defineProps<Props>()
const mermaidContainer = useTemplateRef<HTMLElement>("mermaidContainer")
const { renderError, renderFlowchart } = useMermaid()

const submission = ref<FlowchartSubmission | null>(null)
const loading = ref(false)
const rendering = ref(false)
const showLargeImage = ref(false)

function getPercentType(percent: number) {
  if (percent >= 0.8) return "primary"
  else if (percent >= 0.6) return "info"
  else if (percent >= 0.4) return "warning"
  return "error"
}

async function loadSubmission() {
  if (!props.submissionId) return
  loading.value = true
  try {
    const { getFlowchartSubmission } = await import("oj/api")
    const res = await getFlowchartSubmission(props.submissionId)
    submission.value = res.data

    // 渲染流程图
    if (submission.value?.mermaid_code) {
      rendering.value = true
      await nextTick()
      await renderFlowchart(
        mermaidContainer.value,
        submission.value.mermaid_code,
      )
      rendering.value = false
    }
  } catch (error) {
    console.error("Failed to load submission:", error)
  } finally {
    loading.value = false
  }
}

watch(() => props.submissionId, loadSubmission, { immediate: true })
</script>

<style scoped>
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

.loading-container {
  min-height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

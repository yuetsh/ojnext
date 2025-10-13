<script lang="ts" setup>
import { atou } from "utils/functions"
import { useMermaid } from "shared/composables/useMermaid"
import { Evaluation } from "../composables/useFlowchart"

interface Props {
  evaluation: Evaluation | null
  myFlowchartZippedStr: string
  myMermaidCode: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  loadToEditor: [data: any]
}>()

const showDetailModal = ref(false)

// mermaid 渲染相关
const mermaidContainer = useTemplateRef<HTMLElement>("mermaidContainer")

// 使用 mermaid composable
const { renderError, renderFlowchart } = useMermaid()

// 根据分数获取标签类型
const getScoreType = (score: number) => {
  if (score >= 90) return "success"
  if (score >= 80) return "info"
  if (score >= 70) return "warning"
  return "error"
}

async function openDetailModal() {
  showDetailModal.value = true
  await nextTick()
  await renderFlowchart(mermaidContainer.value, props.myMermaidCode)
}

function closeModal() {
  showDetailModal.value = false
}

function loadToEditor() {
  if (props.myFlowchartZippedStr) {
    const str = atou(props.myFlowchartZippedStr)
    const json = JSON.parse(str)
    const processedData = {
      nodes: json.nodes || [],
      edges: json.edges || [],
    }
    emit("loadToEditor", processedData)
  }
  closeModal()
}
</script>

<template>
  <div>
    <!-- 评分结果显示 -->
    <n-button
      secondary
      v-if="evaluation"
      @click="openDetailModal"
      :type="getScoreType(evaluation.score)"
    >
      {{ evaluation.score }}分 {{ evaluation.grade }}级
    </n-button>

    <!-- 详情弹框 -->
    <n-modal
      v-model:show="showDetailModal"
      preset="card"
      title="评分详情"
      style="width: 1000px"
    >
      <n-grid :cols="5" :x-gap="16">
        <n-gi :span="3">
          <n-card title="流程图预览">
            <n-alert v-if="renderError" type="error" title="流程图渲染失败">
              <template #default>
                {{ renderError }}
              </template>
            </n-alert>
            <div v-else ref="mermaidContainer" class="flowchart"></div>
          </n-card>
          <n-flex style="margin-top: 16px" justify="center">
            <n-button @click="loadToEditor" type="primary">
              加载到流程图编辑器
            </n-button>
          </n-flex>
        </n-gi>
        <n-gi :span="2">
          <n-card
            v-if="evaluation?.feedback"
            size="small"
            title="AI反馈"
            style="margin-bottom: 16px"
          >
            <n-text>{{ evaluation.feedback }}</n-text>
          </n-card>

          <!-- 建议部分 -->
          <n-card
            v-if="evaluation?.suggestions"
            size="small"
            title="改进建议"
            style="margin-bottom: 16px"
          >
            <n-text>{{ evaluation.suggestions }}</n-text>
          </n-card>

          <!-- 详细评分部分 -->
          <n-card
            v-if="evaluation?.criteria_details"
            size="small"
            title="详细评分"
          >
            <div
              v-for="(detail, key) in evaluation.criteria_details"
              :key="key"
              style="margin-bottom: 12px"
            >
              <n-flex
                justify="space-between"
                align="center"
                style="margin-bottom: 4px"
              >
                <n-text strong>{{ key }}</n-text>
                <n-tag
                  :type="getScoreType(detail.score || 0)"
                  size="small"
                  round
                >
                  {{ detail.score || 0 }}分 / {{ detail.max }}分
                </n-tag>
              </n-flex>
              <n-text v-if="detail.comment" depth="3" style="font-size: 12px">
                {{ detail.comment }}
              </n-text>
            </div>
          </n-card>
        </n-gi>
      </n-grid>
    </n-modal>
  </div>
</template>

<style scoped>
.flowchart {
  height: 500px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.flowchart > svg) {
  height: 100%;
}
</style>

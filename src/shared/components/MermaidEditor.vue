<script setup lang="ts">
import { copyToClipboard } from "utils/functions"
import { useMermaid } from "shared/composables/useMermaid"

const modelValue = defineModel<string>({ default: "" })
const mermaidContainer = useTemplateRef<HTMLElement>("mermaidContainer")

const { renderFlowchart, renderError, renderSuccess } = useMermaid()

const emit = defineEmits<{
  renderSuccess: []
}>()

const renderMermaid = async () => {
  await renderFlowchart(mermaidContainer.value, modelValue.value)
  if (renderSuccess.value) emit("renderSuccess")
}

onMounted(() => {
  nextTick(renderMermaid)
})

watch(modelValue, renderMermaid)

const clearCode = () => {
  modelValue.value = ""
}

const copyCode = () => {
  copyToClipboard(modelValue.value)
}

onBeforeUnmount(() => {
  if (mermaidContainer.value) {
    mermaidContainer.value.innerHTML = ""
  }
})
</script>

<template>
  <n-flex>
    <n-flex vertical>
      <n-flex align="center">
        <span>Mermaid 代码</span>
        <n-flex align="center">
          <n-button text @click="copyCode" size="small" type="primary">
            复制
          </n-button>
          <n-button text @click="clearCode" type="error" size="small">
            清空
          </n-button>
        </n-flex>
      </n-flex>
      <n-input
        class="code-editor"
        v-model:value="modelValue"
        type="textarea"
        :autosize="{ minRows: 10, maxRows: 20 }"
      />
    </n-flex>
    <n-flex vertical>
      <n-flex align="center" justify="space-between">
        <span>图表预览</span>
        <n-tag v-if="modelValue && renderSuccess" type="success" size="small">
          ✓ 渲染成功
        </n-tag>
      </n-flex>
      <n-alert
        v-if="renderError"
        type="error"
        title="Mermaid 语法错误"
        style="margin-bottom: 8px"
      >
        <n-text style="font-size: 12px">{{ renderError }}</n-text>
      </n-alert>
      <div ref="mermaidContainer" class="mermaid-container"></div>
    </n-flex>
  </n-flex>
</template>

<style scoped>
.code-editor {
  flex: 1;
  width: 400px;
}
.mermaid-container {
  width: 400px;
  min-height: 400px;
  border: 1px solid #d9d9d9;
  border-radius: 3px;
  padding: 16px;
}
</style>

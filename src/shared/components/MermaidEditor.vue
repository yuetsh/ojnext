<script setup lang="ts">
import { copyToClipboard, getRandomId } from "utils/functions"

// 动态导入 mermaid
let mermaid: any = null

const modelValue = defineModel<string>({ default: "" })
const mermaidContainer = useTemplateRef<HTMLElement>("mermaidContainer")

// 渲染状态
const renderSuccess = ref(false)

// 定义事件
const emit = defineEmits<{
  renderSuccess: []
}>()

// 动态加载 Mermaid
const loadMermaid = async () => {
  if (!mermaid) {
    const mermaidModule = await import("mermaid")
    mermaid = mermaidModule.default
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: "default",
    })
  }
  return mermaid
}

// 初始化
onMounted(async () => {
  await loadMermaid()
  nextTick(() => {
    renderMermaid()
  })
})

// 监听代码变化
watch(modelValue, () => {
  renderMermaid()
})

// 渲染Mermaid图表
const renderMermaid = async () => {
  if (!mermaidContainer.value) {
    renderSuccess.value = false
    return
  }

  // 总是先清空容器
  mermaidContainer.value.innerHTML = ""

  // 如果没有内容，直接返回
  if (!modelValue.value.trim()) {
    renderSuccess.value = false
    return
  }

  try {
    // 确保 mermaid 已加载
    const mermaidInstance = await loadMermaid()
    const id = `mermaid-${getRandomId()}`
    const { svg } = await mermaidInstance.render(id, modelValue.value)
    mermaidContainer.value.innerHTML = svg

    // 渲染成功
    renderSuccess.value = true
    emit("renderSuccess")
  } catch (error: any) {
    const errorMessage = error?.message || "请检查代码语法"
    renderSuccess.value = false

    mermaidContainer.value.innerHTML = `
      <div style="color: #ff4d4f; padding: 20px; text-align: center; border: 1px dashed #ff4d4f; border-radius: 4px;">
        <p>❌ Mermaid语法错误</p>
        <p style="font-size: 12px; color: #666;">${errorMessage}</p>
      </div>
    `
  }
}

// 清空代码
const clearCode = () => {
  modelValue.value = ""
}

// 复制代码
const copyCode = async () => {
  copyToClipboard(modelValue.value)
}

// 组件卸载时清空容器
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
        ref="codeEditor"
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

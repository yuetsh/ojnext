<script setup lang="ts">
import { useProblemStore } from "oj/store/problem"
import { nanoid } from "nanoid"

const problemStore = useProblemStore()
const { problem } = storeToRefs(problemStore)
const mermaidContainer = useTemplateRef<HTMLElement>("mermaidContainer")

// 渲染状态
const renderError = ref<string | null>(null)

// 动态导入 mermaid
let mermaid: any = null

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

// 渲染流程图的函数
const renderFlowchart = async () => {
  try {
    renderError.value = null

    // 确保 mermaid 已加载
    await loadMermaid()

    // 渲染流程图
    if (mermaidContainer.value && problem.value?.mermaid_code) {
      const id = `mermaid-${nanoid()}`
      const { svg } = await mermaid.render(id, problem.value.mermaid_code)
      mermaidContainer.value.innerHTML = svg
    }
  } catch (error) {
    renderError.value =
      error instanceof Error ? error.message : "流程图渲染失败，请检查代码格式"
  }
}

// 初始化Mermaid并渲染
onMounted(() => {
  renderFlowchart()
})
</script>

<template>
  <div>
    <n-alert v-if="renderError" type="error" title="流程图渲染失败">
      <template #default>
        {{ renderError }}
      </template>
    </n-alert>
    <div v-else ref="mermaidContainer" class="container"></div>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  max-width: 100%;
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

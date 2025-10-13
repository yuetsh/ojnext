<script setup lang="ts">
import { useProblemStore } from "oj/store/problem"
import { useMermaid } from "shared/composables/useMermaid"

const problemStore = useProblemStore()
const { problem } = storeToRefs(problemStore)
const mermaidContainer = useTemplateRef<HTMLElement>("mermaidContainer")

// 使用 mermaid composable
const { renderError, renderFlowchart } = useMermaid()

// 渲染流程图的函数
const renderProblemFlowchart = async () => {
  if (problem.value?.mermaid_code) {
    await renderFlowchart(mermaidContainer.value, problem.value.mermaid_code)
  }
}

// 初始化Mermaid并渲染
onMounted(() => {
  renderProblemFlowchart()
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

<script setup lang="ts">
import { useMyFlowchartStore } from "shared/store/myFlowchart"
import { useMermaid } from "shared/composables/useMermaid"

const store = useMyFlowchartStore()
const { renderError, renderFlowchart } = useMermaid()
const mermaidContainer = useTemplateRef<HTMLElement>("mermaidContainer")

watch(
  () => store.mermaidCode,
  async (code) => {
    if (!code) return
    await nextTick()
    await renderFlowchart(mermaidContainer.value, code)
  },
  { immediate: true },
)
</script>

<template>
  <div style="padding: 8px 0">
    <n-alert v-if="renderError" type="error" title="渲染失败" size="small">
      {{ renderError }}
    </n-alert>
    <div v-else ref="mermaidContainer" class="flowchart-container"></div>
  </div>
</template>

<style scoped>
.flowchart-container {
  width: 100%;
  min-height: 500px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

:deep(.flowchart-container > svg) {
  width: 100%;
  height: auto;
}
</style>

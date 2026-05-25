<script setup lang="ts">
import { usePinnedFlowchartStore } from "shared/store/pinnedFlowchart"
import { useMermaid } from "shared/composables/useMermaid"

const store = usePinnedFlowchartStore()
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
  <n-flex vertical :size="8" style="padding: 8px 0">
    <n-flex justify="end">
      <n-button size="small" secondary @click="store.unpin()"
        >取消固定</n-button
      >
    </n-flex>
    <n-alert v-if="renderError" type="error" title="渲染失败" size="small">
      {{ renderError }}
    </n-alert>
    <div v-else ref="mermaidContainer" class="flowchart-container"></div>
  </n-flex>
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

<script setup lang="ts">
import { useProblemStore } from "oj/store/problem"
import { useMermaid } from "shared/composables/useMermaid"

const problemStore = useProblemStore()
const { problem } = storeToRefs(problemStore)
const mermaidContainer = useTemplateRef<HTMLElement>("mermaidContainer")

const { renderError, renderFlowchart } = useMermaid()

const renderProblemFlowchart = async () => {
  await renderFlowchart(
    mermaidContainer.value,
    problem.value?.mermaid_code ?? "",
  )
}

onMounted(renderProblemFlowchart)

watch(() => problem.value?.mermaid_code, renderProblemFlowchart)
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

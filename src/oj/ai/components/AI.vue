<template>
  <n-spin :show="aiStore.loading.ai">
    <div class="container">
      <MdPreview :model-value="aiStore.mdContent" />
    </div>
  </n-spin>
</template>
<script setup lang="ts">
import { useAIStore } from "oj/store/ai"
import { MdPreview } from "md-editor-v3"
import "md-editor-v3/lib/preview.css"

const aiStore = useAIStore()
watch(
  () => [aiStore.loading.details, aiStore.loading.weekly],
  (newVal) => {
    if (newVal.every((val) => val === false)) {
      aiStore.fetchAIAnalysis()
    }
  },
  { immediate: true },
)
</script>
<style scoped>
.container {
  min-height: 200px;
}
</style>

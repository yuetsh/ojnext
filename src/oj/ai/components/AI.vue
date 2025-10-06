<template>
  <n-card size="small">
    <template #header>
      <div class="cool-title">
        <span class="title-text">AI 帮你分析</span>
      </div>
    </template>
    <n-spin :show="aiStore.loading.ai">
      <div class="container">
        <MdPreview :model-value="aiStore.mdContent" />
      </div>
    </n-spin>
  </n-card>
</template>
<script setup lang="ts">
import { useAIStore } from "oj/store/ai"
import { MdPreview } from "md-editor-v3"
import "md-editor-v3/lib/preview.css"

const aiStore = useAIStore()
watch(
  () => aiStore.loading.fetching,
  (isLoading) => {
    if (!isLoading) {
      aiStore.fetchAIAnalysis()
    }
  },
  { immediate: true },
)
</script>
<style scoped>
.cool-title {
  position: relative;
  padding: 8px 0;
}

.title-text {
  font-size: 16px;
  font-weight: 700;
  background: linear-gradient(45deg, #667eea, #764ba2, #f093fb);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 0.8px;
  position: relative;
  z-index: 2;
  animation: gradient-flow 3s ease infinite;
}

@keyframes gradient-flow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.container {
  min-height: 200px;
}
:deep(.md-editor-preview h1) {
  margin-top: 0;
}
</style>

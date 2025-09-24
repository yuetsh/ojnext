<template>
  <n-spin :show="aiStore.loading.ai">
    <div>AI 小助手友情提醒</div>
  </n-spin>
</template>
<script setup lang="ts">
import { useAIStore } from "~/oj/store/ai"

const aiStore = useAIStore()

watch(
  () => [
    aiStore.loading.details,
    aiStore.loading.weekly,
  ],
  (newVal, oldVal) => {
    if (!oldVal) return
    const loaded = newVal.some((val, idx) => val === false && oldVal[idx] === true)
    if (loaded) {
      aiStore.fetchAIAnalysis()
    }
  },
  { immediate: true },
)
</script>

<template>
  <div align="center" style="display: inline-flex; margin: 0 10px;">
    <img src="/S.png" alt="S Grade" v-if="props.grade === 'S'" />
    <img src="/A.png" alt="A Grade" v-if="props.grade === 'A'" />
    <img src="/B.png" alt="B Grade" v-if="props.grade === 'B'" />
    <img src="/C.png" alt="C Grade" v-if="props.grade === 'C'" />
    <n-tooltip trigger="hover">
      <template #trigger>
        <n-icon size="16" style="cursor: help;">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
          </svg>
        </n-icon>
      </template>
      <div style="max-width: 300px; line-height: 1.4;">
        <div style="font-weight: bold; margin-bottom: 8px;">等级计算说明</div>
        <div>使用加权平均方法计算综合等级：</div>
        <div>• S级 = 4分，A级 = 3分，B级 = 2分，C级 = 1分</div>
        <div>• 根据平均分数确定最终等级：</div>
        <div>  - S级：≥3.5分</div>
        <div>  - A级：2.5-3.5分</div>
        <div>  - B级：1.5-2.5分</div>
        <div>  - C级：<1.5分</div>
      </div>
    </n-tooltip>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{
  grade: "S" | "A" | "B" | "C"
}>()
</script>
<style scoped>
img {
  animation: shake 0.5s infinite;
  width: 30px;
  height: 30px;
}

@keyframes shake {
  0% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-10px) scale(1.1);
  }
  100% {
    transform: translateY(0) scale(1);
  }
}
</style>

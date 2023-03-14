<script lang="ts" setup>
const props = defineProps<{ problemID: number }>()

function download() {
  console.log(props.problemID)
}
</script>
<template>
  <n-tooltip>
    <template #trigger>
      <n-button size="small" tertiary @click="download">下载</n-button>
    </template>
    下载测试用例
  </n-tooltip>
</template>

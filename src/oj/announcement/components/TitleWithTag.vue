<template>
  <n-flex align="center">
    <n-tag type="error" v-if="top">置顶</n-tag>
    <span>{{ title }}</span>
  </n-flex>
</template>
<script setup lang="ts">
interface Props {
  top: boolean
  title: string
}

defineProps<Props>()
</script>

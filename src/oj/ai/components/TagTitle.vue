<template>
  <n-flex vertical align="start">
    <n-flex align="center">
      <n-tag type="info" size="small" :bordered="false">比赛</n-tag>
      <span>{{ problem.contest_title }}</span>
    </n-flex>
    <span>{{ problem.display_id }} {{ problem.title }}</span>
  </n-flex>
</template>
<script setup lang="ts">
interface Props {
  problem: {
    title: string
    display_id: string
    contest_title: string
    contest_id: number
  }
}

const props = defineProps<Props>()
</script>

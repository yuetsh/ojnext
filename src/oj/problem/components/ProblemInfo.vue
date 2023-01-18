<script setup lang="ts">
import { DIFFICULTY } from "utils/constants"
import { getACRate, getTagColor, parseTime } from "utils/functions"
import { isDesktop } from "~/shared/composables/breakpoints"
import { Problem } from "utils/types"

interface Props {
  problem: Problem
}
defineProps<Props>()
</script>

<template>
  <n-descriptions bordered label-placement="left" :column="isDesktop ? 3 : 1">
    <n-descriptions-item label="编号">
      {{ problem._id }}
    </n-descriptions-item>
    <n-descriptions-item label="出题人">
      {{ problem.created_by.username }}
    </n-descriptions-item>
    <n-descriptions-item label="创建时间">
      {{ parseTime(problem.create_time) }}
    </n-descriptions-item>
    <n-descriptions-item label="难度">
      <n-tag :type="getTagColor(problem.difficulty)">
        {{ DIFFICULTY[problem.difficulty] }}
      </n-tag>
    </n-descriptions-item>
    <n-descriptions-item label="时间限制">
      {{ problem.time_limit }}毫秒
    </n-descriptions-item>
    <n-descriptions-item label="内存限制">
      {{ problem.memory_limit }}MB
    </n-descriptions-item>
    <n-descriptions-item label="提交正确">
      {{ problem.accepted_number }}次
    </n-descriptions-item>
    <n-descriptions-item label="提交错误">
      {{ problem.submission_number - problem.accepted_number }}次
    </n-descriptions-item>
    <n-descriptions-item label="正确率">
      {{ getACRate(problem.accepted_number, problem.submission_number) }}
    </n-descriptions-item>
    <n-descriptions-item :span="3" label="标签">
      <n-space>
        <n-tag type="info" v-for="tag in problem.tags" :key="tag">
          {{ tag }}
        </n-tag>
      </n-space>
    </n-descriptions-item>
  </n-descriptions>
</template>

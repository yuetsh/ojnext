<script setup lang="ts">
import { DIFFICULTY } from "utils/constants"
import { getACRate, getTagColor, parseTime } from "utils/functions"
import { isDesktop } from "utils/breakpoints"
import { Problem } from "utils/types"

interface Props {
  problem: Problem
}
defineProps<Props>()
</script>

<template>
  <el-descriptions border :column="isDesktop ? 3 : 1">
    <el-descriptions-item label="编号">
      {{ problem._id }}
    </el-descriptions-item>
    <el-descriptions-item label="出题人">
      {{ problem.created_by.username }}
    </el-descriptions-item>
    <el-descriptions-item label="创建时间">
      {{ parseTime(problem.create_time) }}
    </el-descriptions-item>

    <el-descriptions-item label="时间限制">
      {{ problem.time_limit }}毫秒
    </el-descriptions-item>
    <el-descriptions-item label="内存限制">
      {{ problem.memory_limit }}MB
    </el-descriptions-item>
    <el-descriptions-item label="难度">
      <el-tag
        disable-transitions
        :type="(getTagColor(problem.difficulty) as any)"
      >
        {{ DIFFICULTY[problem.difficulty] }}
      </el-tag>
    </el-descriptions-item>

    <el-descriptions-item label="提交正确">
      {{ problem.accepted_number }}次
    </el-descriptions-item>
    <el-descriptions-item label="提交错误">
      {{ problem.submission_number - problem.accepted_number }}次
    </el-descriptions-item>
    <el-descriptions-item label="正确率">
      {{ getACRate(problem.accepted_number, problem.submission_number) }}
    </el-descriptions-item>

    <el-descriptions-item :span="3" label="标签">
      <el-space>
        <el-tag
          disable-transitions
          type="info"
          v-for="tag in problem.tags"
          :key="tag"
        >
          {{ tag }}
        </el-tag>
      </el-space>
    </el-descriptions-item>
  </el-descriptions>
</template>

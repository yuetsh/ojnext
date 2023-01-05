<script setup lang="ts">
import { defineProps } from "vue"
import { DIFFICULTY, getTagColor } from "../../utils/constants"
import { getACRate } from "../../utils/functions"

const { problem } = defineProps(["problem"])
</script>

<template>
  <el-descriptions border>
    <el-descriptions-item label="编号">
      {{ problem._id }}
    </el-descriptions-item>
    <el-descriptions-item label="出题人">
      {{ problem.created_by.username }}
    </el-descriptions-item>
    <el-descriptions-item label="难度">
      <el-tag :type="getTagColor(problem.difficulty)">
        {{ DIFFICULTY[<"Low" | "Mid" | "High">problem.difficulty] }}
      </el-tag>
    </el-descriptions-item>
    <el-descriptions-item label="时间限制">
      {{ problem.time_limit }}毫秒
    </el-descriptions-item>
    <el-descriptions-item label="内存限制">
      {{ problem.memory_limit }}MB
    </el-descriptions-item>
    <el-descriptions-item label="类型">
      {{ problem.rule_type }}
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
        <el-tag type="info" v-for="tag in problem.tags" :key="tag">
          {{ tag }}
        </el-tag>
      </el-space>
    </el-descriptions-item>
  </el-descriptions>
</template>

<style scoped></style>

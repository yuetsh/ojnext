<script setup lang="ts">
import { parseTime } from "utils/functions"
import { ProblemSet } from "utils/types"

interface Props {
  problemSet: ProblemSet
}

defineProps<Props>()
</script>

<template>
  <n-card title="题单信息" style="margin-bottom: 16px">
    <n-descriptions :column="4" bordered>
      <n-descriptions-item label="描述">
        {{ problemSet.description }}
      </n-descriptions-item>
      <n-descriptions-item label="创建者">
        {{ problemSet.created_by.username }}
      </n-descriptions-item>
      <n-descriptions-item label="难度">
        <n-tag
          :type="
            problemSet.difficulty === 'Easy'
              ? 'success'
              : problemSet.difficulty === 'Medium'
                ? 'warning'
                : 'error'
          "
        >
          {{
            problemSet.difficulty === "Easy"
              ? "简单"
              : problemSet.difficulty === "Medium"
                ? "中等"
                : "困难"
          }}
        </n-tag>
      </n-descriptions-item>
      <n-descriptions-item label="状态">
        <n-tag
          :type="
            problemSet.status === 'active'
              ? 'success'
              : problemSet.status === 'archived'
                ? 'default'
                : 'info'
          "
        >
          {{
            problemSet.status === "active"
              ? "活跃"
              : problemSet.status === "archived"
                ? "已归档"
                : "草稿"
          }}
        </n-tag>
      </n-descriptions-item>
      <n-descriptions-item label="可见">
        {{ problemSet.visible ? "是" : "否" }}
      </n-descriptions-item>
      <n-descriptions-item label="题目数量">
        {{ problemSet.problems_count }}
      </n-descriptions-item>
      <n-descriptions-item label="创建时间">
        {{
          parseTime(problemSet.create_time, "YYYY-MM-DD HH:mm:ss")
        }}
      </n-descriptions-item>
    </n-descriptions>
  </n-card>
</template>

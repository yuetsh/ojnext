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
    <n-flex vertical gap="medium">
      <n-flex>
        <span style="width: 100px; font-weight: bold">描述：</span>
        <span>{{ problemSet.description }}</span>
      </n-flex>
      <n-flex>
        <span style="width: 100px; font-weight: bold">创建者：</span>
        <span>{{ problemSet.created_by.username }}</span>
      </n-flex>
      <n-flex>
        <span style="width: 100px; font-weight: bold">难度：</span>
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
      </n-flex>
      <n-flex>
        <span style="width: 100px; font-weight: bold">状态：</span>
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
      </n-flex>
      <n-flex>
        <span style="width: 100px; font-weight: bold">可见：</span>
        <span>{{ problemSet.visible ? "是" : "否" }}</span>
      </n-flex>
      <n-flex>
        <span style="width: 100px; font-weight: bold">题目数量：</span>
        <span>{{ problemSet.problems_count }}</span>
      </n-flex>
      <n-flex>
        <span style="width: 100px; font-weight: bold">创建时间：</span>
        <span>{{
          parseTime(problemSet.create_time, "YYYY-MM-DD HH:mm:ss")
        }}</span>
      </n-flex>
    </n-flex>
  </n-card>
</template>

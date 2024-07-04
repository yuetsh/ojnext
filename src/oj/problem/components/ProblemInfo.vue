<script setup lang="ts">
import { problem } from "oj/composables/problem"
import { DIFFICULTY, JUDGE_STATUS } from "utils/constants"
import { getACRate, getTagColor, parseTime } from "utils/functions"
import { Pie } from "vue-chartjs"
import { isDesktop } from "~/shared/composables/breakpoints"

const data = computed(() => {
  const status = problem.value!.statistic_info
  const labels = []
  for (let i in status) {
    if (status[i] !== 0) {
      // @ts-ignore
      labels.push(JUDGE_STATUS[i]["name"])
    }
  }
  return {
    labels,
    datasets: [
      { data: Object.values(status), hoverOffset: 5, borderRadius: 10 },
    ],
  }
})

const options = {
  plugins: {
    title: { text: "提交结果的比例", display: true, font: { size: 20 } },
  },
}
</script>

<template>
  <n-descriptions
    bordered
    label-placement="left"
    :column="isDesktop ? 3 : 1"
    v-if="problem"
  >
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
      <n-flex>
        <n-tag size="small" type="info" v-for="tag in problem.tags" :key="tag">
          {{ tag }}
        </n-tag>
      </n-flex>
    </n-descriptions-item>
  </n-descriptions>
  <div class="pie" v-if="problem && problem.submission_number > 0">
    <Pie :data="data" :options="options" />
  </div>
</template>
<style scoped>
.pie {
  width: 100%;
  max-width: 500px;
  margin: 24px auto;
}
</style>

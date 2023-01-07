<script setup lang="ts">
const { problem } = defineProps(["problem"])
</script>

<template>
  <h1>{{ problem.title }}</h1>
  <p class="title">描述</p>
  <div class="content" v-html="problem.description"></div>

  <p class="title">输入</p>
  <div class="content" v-html="problem.input_description"></div>

  <p class="title">输出</p>
  <div class="content" v-html="problem.output_description"></div>

  <div v-if="problem.hint">
    <p class="title">提示</p>
    <el-card shadow="never">
      <div class="content" v-html="problem.hint"></div>
    </el-card>
  </div>

  <div v-for="(sample, index) of problem.samples" :key="index">
    <p class="title">测试用例 {{ index + 1 }}</p>
    <el-descriptions border direction="vertical">
      <el-descriptions-item width="50%" label="输入">
        <div class="testcase">{{ sample.input }}</div>
      </el-descriptions-item>
      <el-descriptions-item width="50%" label="输出">
        <div class="testcase">{{ sample.output }}</div>
      </el-descriptions-item>
    </el-descriptions>
  </div>

  <div v-if="problem.source">
    <p class="title">来源</p>
    <div class="content" v-html="problem.source"></div>
  </div>
</template>

<style scoped>
.title {
  font-size: 20px;
  margin: 24px 0 16px 0;
  color: var(--el-color-primary);
}

.content {
  line-height: 2;
}

.label {
  display: flex;
  align-items: center;
}

.testcase {
  white-space: pre;
}
</style>

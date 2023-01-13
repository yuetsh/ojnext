<script setup lang="ts">
import { Problem } from "../../../utils/types"
import { Flag } from "@element-plus/icons-vue"
import { useTestcaseReultStore } from "../../stores/testcaseResult"
import { useCodeStore } from "../../stores/code"
import { SOURCES } from "../../../utils/constants"

interface Props {
  problem: Problem
}

const props = defineProps<Props>()

const { code } = useCodeStore()
const testcaseResultStore = useTestcaseReultStore()

const disabled = computed(
  () =>
    !!(
      code.value.trim() === "" ||
      code.value === props.problem.template[code.language] ||
      code.value === SOURCES[code.language]
    )
)

function test(input: string) {
  testcaseResultStore.runTestcase(code, input)
}
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
    <el-space>
      <p class="title testcaseTitle">测试用例 {{ index + 1 }}</p>
      <el-button
        :icon="Flag"
        type="success"
        :disabled="disabled"
        circle
        @click="test(sample.input)"
      ></el-button>
    </el-space>
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
.testcaseTitle {
  margin-bottom: 24px;
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

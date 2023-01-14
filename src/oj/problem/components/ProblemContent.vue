<script setup lang="ts">
import { Flag, CloseBold, Select, CopyDocument } from "@element-plus/icons-vue"
import copy from "copy-text-to-clipboard"
import { useCodeStore } from "oj/store/code"
import { SOURCES } from "utils/constants"
import { Problem } from "utils/types"
import { createTestSubmission } from "utils/judge"
import { submissionExists } from "oj/api"

interface Props {
  problem: Problem
}
type Sample = Problem["samples"][number] & {
  id: number
  msg: string
  status: "passed" | "failed" | "not_test"
  loading: boolean
}

const props = defineProps<Props>()
const route = useRoute()
const contestID = <string>route.params.contestID
const { data: hasSolved, execute } = submissionExists(props.problem.id)
if (contestID) {
  execute()
}
const samples = ref<Sample[]>(
  props.problem.samples.map((sample, index) => ({
    ...sample,
    id: index,
    msg: "",
    status: "not_test",
    loading: false,
  }))
)
const { code } = useCodeStore()

const disabled = computed(
  () =>
    !!(
      code.value.trim() === "" ||
      code.value === props.problem.template[code.language] ||
      code.value === SOURCES[code.language]
    )
)
async function test(sample: Sample, index: number) {
  samples.value = samples.value.map((sample) => {
    if (sample.id === index) {
      sample.loading = true
    }
    return sample
  })
  const res = await createTestSubmission(code, sample.input)
  samples.value = samples.value.map((sample) => {
    if (sample.id === index) {
      const status =
        res.status === 3 && res.output.trim() === sample.output
          ? "passed"
          : "failed"
      return {
        ...sample,
        msg: res.output,
        status: status,
        loading: false,
      }
    } else {
      return sample
    }
  })
}

const icon = (status: Sample["status"]) =>
  ({
    not_test: Flag,
    failed: CloseBold,
    passed: Select,
  }[status])
const type = (status: Sample["status"]) =>
  ({
    not_test: "warning",
    failed: "danger",
    passed: "success",
  }[status])
</script>

<template>
  <el-alert
    v-if="problem.my_status === 0 || (contestID && hasSolved)"
    type="success"
    :closable="false"
    center
    title="🎉 本 题 已 经 被 你 解 决 啦"
    effect="dark"
  >
  </el-alert>

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

  <div v-for="(sample, index) of samples" :key="index">
    <el-space>
      <p class="title testcaseTitle">测试用例 {{ index + 1 }}</p>
      <el-button
        :icon="icon(sample.status)"
        :type="type(sample.status)"
        :disabled="disabled"
        :loading="sample.loading"
        circle
        @click="test(sample, index)"
      ></el-button>
    </el-space>
    <el-descriptions border direction="vertical" :column="2">
      <el-descriptions-item width="50%">
        <template #label>
          <el-space>
            <span>输入</span>
            <el-icon @click="copy(sample.input)"><CopyDocument /> </el-icon>
          </el-space>
        </template>
        <div class="testcase">{{ sample.input }}</div>
      </el-descriptions-item>
      <el-descriptions-item width="50%">
        <template #label>
          <el-space>
            <span>输出</span>
            <el-icon @click="copy(sample.output)"><CopyDocument /> </el-icon>
          </el-space>
        </template>
        <div class="testcase">{{ sample.output }}</div>
      </el-descriptions-item>
      <el-descriptions-item label="运行结果" v-if="sample.status === 'failed'">
        <div class="testcase">{{ sample.msg }}</div>
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

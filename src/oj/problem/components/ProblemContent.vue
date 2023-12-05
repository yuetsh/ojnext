<script setup lang="ts">
import Copy from "~/shared/components/Copy.vue"
import { code } from "oj/composables/code"
import { problem } from "oj/composables/problem"
import { Problem, ProblemStatus } from "utils/types"
import { createTestSubmission } from "utils/judge"
import { useThemeVars } from "naive-ui"

type Sample = Problem["samples"][number] & {
  id: number
  msg: string
  status: ProblemStatus
  loading: boolean
}

const theme = useThemeVars()
const style = computed(() => "color: " + theme.value.primaryColor)

const samples = ref<Sample[]>(
  problem.value!.samples.map((sample, index) => ({
    ...sample,
    id: index,
    msg: "",
    status: "not_test",
    loading: false,
  })),
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

  const id = setTimeout(() => {
    clearTimeout(id)
    samples.value = samples.value.map((sample) => {
      if (sample.id === index) {
        return {
          ...sample,
          msg: res.output,
          status: "not_test",
          loading: false,
        }
      } else {
        return sample
      }
    })
  }, 2000)
}

function label(status: ProblemStatus, loading: boolean) {
  if (loading) return "测试中"
  return {
    not_test: "测试",
    failed: "不通过",
    passed: "通过",
  }[status]
}

function type(status: ProblemStatus) {
  return {
    not_test: "",
    failed: "error",
    passed: "success",
  }[status] as "warning" | "error" | "success"
}
</script>

<template>
  <div v-if="problem" class="problemContent">
    <n-alert
      class="success"
      v-if="problem.my_status === 0"
      type="success"
      title="🎉 本 题 已 经 被 你 解 决 啦"
    />

    <n-space align="center">
      <n-tag>{{ problem._id }}</n-tag>
      <h2 class="problemTitle">{{ problem.title }}</h2>
    </n-space>
    <p class="title" :style="style">描述</p>
    <div class="content" v-html="problem.description"></div>

    <p class="title" :style="style">输入</p>
    <div class="content" v-html="problem.input_description"></div>

    <p class="title" :style="style">输出</p>
    <div class="content" v-html="problem.output_description"></div>

    <div v-if="problem.hint">
      <p class="title" :style="style">提示</p>
      <div class="content" v-html="problem.hint"></div>
    </div>

    <div v-for="(sample, index) of samples" :key="index">
      <n-space align="center">
        <p class="title" :style="style">测试样例 {{ index + 1 }}</p>
        <n-button
          size="small"
          :type="type(sample.status)"
          @click="test(sample, index)"
        >
          {{ label(sample.status, sample.loading) }}
        </n-button>
      </n-space>
      <n-descriptions
        bordered
        :column="2"
        label-style="width: 50%; min-width: 100px"
      >
        <n-descriptions-item>
          <template #label>
            <n-space>
              <span>输入</span>
              <Copy :value="sample.input" />
            </n-space>
          </template>
          <div class="testcase">{{ sample.input }}</div>
        </n-descriptions-item>
        <n-descriptions-item>
          <template #label>
            <n-space>
              <span>输出</span>
              <Copy :value="sample.output" />
            </n-space>
          </template>
          <div class="testcase">{{ sample.output }}</div>
        </n-descriptions-item>
        <n-descriptions-item label="运行结果" v-if="sample.msg">
          <div class="testcase">{{ sample.msg }}</div>
        </n-descriptions-item>
      </n-descriptions>
    </div>

    <div v-if="problem.source">
      <p class="title" :style="style">来源</p>
      <div class="content" v-html="problem.source"></div>
    </div>
  </div>
</template>

<style>
.problemContent .problemTitle {
  margin: 0;
}

.problemContent .title {
  font-size: 20px;
  margin: 12px 0;
}

.problemContent .content {
  font-size: 16px;
  line-height: 2;
}

.problemContent .testcase {
  font-size: 14px;
  white-space: pre;
  font-family: "Consolas";
}

.problemContent .success {
  margin-bottom: 8px;
}

.problemContent > .content > p {
  margin: 0;
}

.problemContent > .content > blockquote {
  border-left: 3px solid #bbbec4;
  padding-left: 10px;
  margin: 10px 0;
  color: #7b7b7b;
}

.problemContent > .content > pre {
  width: 100%;
  background-color: rgb(250, 250, 252);
  border: 1px solid rgb(239, 239, 245);
  word-break: break-word;
  box-sizing: border-box;
  transition:
    background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.problemContent > .content > pre > code {
  font-family: "Consolas";
}

.__layout-dark .problemContent > .content > pre {
  background-color: rgb(24, 24, 28);
  border-color: rgba(255, 255, 255, 0.09);
}

.problemContent > .content > table {
  width: 100%;
  border-spacing: 0;
  border: 1px solid rgba(239, 239, 245, 1);
  transition:
    background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.problemContent > .content > table th {
  background-color: rgba(250, 250, 252, 1);
  transition:
    background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.__layout-dark .problemContent > .content > table th {
  background-color: rgba(38, 38, 42, 1);
}

.problemContent > .content > table td {
  padding: 8px;
}

.problemContent > .content > table td,
.problemContent > .content > table th {
  border-right: 1px solid rgba(239, 239, 245, 1);
  border-bottom: 1px solid rgba(239, 239, 245, 1);
}

.problemContent > .content > table th:last-child,
.problemContent > .content > table td:last-child {
  border-right: 0px solid rgba(239, 239, 245, 1);
}

.problemContent > .content > table tr:last-child td {
  border-bottom: 0px solid rgba(239, 239, 245, 1);
}

.problemContent > .content > p > code {
  font-size: 90%;
  padding: 2px 5px;
  margin: 0px 4px;
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
  line-height: 1.5;
}

.problemContent > .content img {
  max-width: 100% !important;
  height: 100% !important;
}

.problemContent > .content a {
  color: #18a058;
}
</style>

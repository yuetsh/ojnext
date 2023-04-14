<script setup lang="ts">
import Copy from "~/shared/Copy.vue"
import { code } from "oj/composables/code"
import { Problem, ProblemStatus } from "utils/types"
import { createTestSubmission } from "utils/judge"
import { useThemeVars } from "naive-ui"

interface Props {
  problem: Problem
}
type Sample = Problem["samples"][number] & {
  id: number
  msg: string
  status: ProblemStatus
  loading: boolean
}

const props = defineProps<Props>()
const theme = useThemeVars()
const style = computed(() => "color: " + theme.value.primaryColor)

const samples = ref<Sample[]>(
  props.problem.samples.map((sample, index) => ({
    ...sample,
    id: index,
    msg: "",
    status: "not_test",
    loading: false,
  }))
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
  <n-alert
    class="success"
    v-if="problem.my_status === 0"
    type="success"
    title="🎉 本 题 已 经 被 你 解 决 啦"
  />

  <n-space align="center">
    <n-tag>{{ problem._id }}</n-tag>
    <h1 class="problemTitle">{{ problem.title }}</h1>
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
      <p class="title testcaseTitle" :style="style">测试用例 {{ index + 1 }}</p>
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
</template>

<style scoped>
.problemTitle {
  margin: 0;
}

.title {
  font-size: 20px;
  margin: 12px 0;
}

.testcaseTitle {
  margin-bottom: 24px;
}

.content {
  font-size: 16px;
  line-height: 2;
}

.testcase {
  font-size: 14px;
  white-space: pre;
}

.success {
  margin-bottom: 8px;
}
</style>

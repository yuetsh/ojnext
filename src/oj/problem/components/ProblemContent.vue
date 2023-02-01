<script setup lang="ts">
import { Promotion, CloseBold, Select } from "@element-plus/icons-vue"
import Copy from "~/shared/Copy.vue"
import { code } from "oj/composables/code"
import { SOURCES } from "utils/constants"
import { Problem, ProblemStatus } from "utils/types"
import { createTestSubmission } from "utils/judge"
import { submissionExists } from "oj/api"
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
const route = useRoute()
const contestID = <string>route.params.contestID
const theme = useThemeVars()
const style = computed(() => "color: " + theme.value.primaryColor)
const solved = ref(false)

onMounted(() => {
  if (contestID) {
    checkSubmisson()
  }
})

const samples = ref<Sample[]>(
  props.problem.samples.map((sample, index) => ({
    ...sample,
    id: index,
    msg: "",
    status: "not_test",
    loading: false,
  }))
)

const disabled = computed(
  () =>
    !!(
      code.value.trim() === "" ||
      code.value === props.problem.template[code.language] ||
      code.value === SOURCES[code.language]
    )
)

async function checkSubmisson() {
  const res = await submissionExists(props.problem.id)
  solved.value = res.data
}

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

const icon = (status: ProblemStatus) =>
  ({
    not_test: Promotion,
    failed: CloseBold,
    passed: Select,
  }[status])
const type = (status: ProblemStatus) =>
  ({
    not_test: "",
    failed: "error",
    passed: "success",
  }[status] as "warning" | "error" | "success")
</script>

<template>
  <n-alert
    v-if="problem.my_status === 0 || (contestID && solved)"
    type="success"
    title="🎉 本 题 已 经 被 你 解 决 啦"
  />

  <h1>{{ problem.title }}</h1>
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
      <n-tooltip trigger="hover">
        <template #trigger>
          <n-button
            :type="type(sample.status)"
            :disabled="disabled"
            :loading="sample.loading"
            circle
            @click="test(sample, index)"
          >
            <template #icon>
              <component :is="icon(sample.status)"></component>
            </template>
          </n-button>
        </template>
        点击测试
      </n-tooltip>
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
      <n-descriptions-item label="运行结果" v-if="sample.status === 'failed'">
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
.title {
  font-size: 20px;
  margin: 24px 0 16px 0;
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
</style>

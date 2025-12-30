<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { useThemeVars } from "naive-ui"
import { storeToRefs } from "pinia"
import { useCodeStore } from "oj/store/code"
import { useProblemStore } from "oj/store/problem"
import { createTestSubmission } from "utils/judge"
import { Problem, ProblemStatus } from "utils/types"
import Copy from "shared/components/Copy.vue"
import { useDark } from "@vueuse/core"
import { MdPreview } from "md-editor-v3"
import "md-editor-v3/lib/preview.css"

type Sample = Problem["samples"][number] & {
  id: number
  msg: string
  status: ProblemStatus
  loading: boolean
}

const theme = useThemeVars()
const style = computed(() => "color: " + theme.value.primaryColor)
const isDark = useDark()
const route = useRoute()
const codeStore = useCodeStore()
const problemStore = useProblemStore()
const { problem } = storeToRefs(problemStore)

const problemSetId = computed(() => route.params.problemSetId)

const hasTriedButNotPassed = computed(() => {
  return (
    problem.value?.my_status !== undefined &&
    problem.value?.my_status !== null &&
    problem.value?.my_status !== 0
  )
})

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
  const res = await createTestSubmission(codeStore.code, sample.input)
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
  <div v-if="problem">
    <template v-if="!problemSetId">
      <!-- 已通过 -->
      <n-alert
        class="status-alert"
        v-if="problem.my_status === 0"
        type="success"
        title="🎉 本 题 已 经 被 你 解 决 啦"
      >
      </n-alert>

      <!-- 尝试过但未通过 -->
      <n-alert
        class="status-alert"
        v-else-if="hasTriedButNotPassed"
        type="warning"
        title="💪 你已经尝试过这道题，但还没有通过"
      >
        不要放弃！仔细检查代码逻辑，或者寻求 AI 的帮助获取灵感。
      </n-alert>
    </template>

    <n-flex align="center">
      <n-tag>{{ problem._id }}</n-tag>
      <h2 class="problemTitle">{{ problem.title }}</h2>
    </n-flex>
    <p class="title" :style="style">
      <n-flex align="center">
        <Icon icon="streamline-emojis:sparkles"></Icon>
        描述
      </n-flex>
    </p>
    <MdPreview
      preview-theme="vuepress"
      :model-value="problem.description"
      :theme="isDark ? 'dark' : 'light'"
    />

    <p class="title" :style="style">
      <n-flex align="center">
        <Icon icon="streamline-emojis:four-leaf-clover"></Icon>
        输入
      </n-flex>
    </p>
    <MdPreview
      preview-theme="vuepress"
      :model-value="problem.input_description"
      :theme="isDark ? 'dark' : 'light'"
    />

    <p class="title" :style="style">
      <n-flex align="center">
        <Icon icon="streamline-emojis:herb"></Icon>
        输出
      </n-flex>
    </p>
    <MdPreview
      preview-theme="vuepress"
      :model-value="problem.output_description"
      :theme="isDark ? 'dark' : 'light'"
    />

    <div v-if="problem.hint">
      <p class="title" :style="style">
        <n-flex align="center">
          <Icon icon="streamline-emojis:seedling"></Icon>
          提示
        </n-flex>
      </p>
      <MdPreview
        preview-theme="preview"
        :model-value="problem.hint"
        :theme="isDark ? 'dark' : 'light'"
      />
    </div>

    <div v-for="(sample, index) of samples" :key="index">
      <n-flex align="center">
        <p class="title" :style="style">例子 {{ index + 1 }}</p>
        <n-button
          size="small"
          :type="type(sample.status)"
          @click="test(sample, index)"
        >
          {{ label(sample.status, sample.loading) }}
        </n-button>
      </n-flex>
      <n-descriptions
        bordered
        :column="2"
        label-style="width: 50%; min-width: 100px"
      >
        <n-descriptions-item>
          <template #label>
            <n-flex>
              <span>输入</span>
              <Copy :value="sample.input" />
            </n-flex>
          </template>
          <div class="testcase">{{ sample.input }}</div>
        </n-descriptions-item>
        <n-descriptions-item>
          <template #label>
            <n-flex>
              <span>输出</span>
              <Copy :value="sample.output" />
            </n-flex>
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
      <MdPreview
        preview-theme="vuepress"
        :model-value="problem.source"
        :theme="isDark ? 'dark' : 'light'"
      />
    </div>
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

.testcase {
  font-size: 14px;
  white-space: pre;
  font-family: "Monaco", monospace;
}

.status-alert {
  margin-bottom: 16px;
}
</style>

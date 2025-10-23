<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { useThemeVars } from "naive-ui"
import { storeToRefs } from "pinia"
import { useCodeStore } from "oj/store/code"
import { useProblemStore } from "oj/store/problem"
import { createTestSubmission } from "utils/judge"
import { Problem, ProblemStatus } from "utils/types"
import Copy from "shared/components/Copy.vue"

type Sample = Problem["samples"][number] & {
  id: number
  msg: string
  status: ProblemStatus
  loading: boolean
}

const theme = useThemeVars()
const style = computed(() => "color: " + theme.value.primaryColor)

const route = useRoute()
const codeStore = useCodeStore()
const problemStore = useProblemStore()
const { problem } = storeToRefs(problemStore)

const problemSetId = computed(() => route.params.problemSetId)

// 判断用户是否尝试过但未通过
// my_status === 0: 已通过
// my_status !== 0 && my_status !== null: 尝试过但未通过
// my_status === null: 从未尝试
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
  <div v-if="problem" class="problemContent">
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
    <div class="content" v-html="problem.description"></div>

    <p class="title" :style="style">
      <n-flex align="center">
        <Icon icon="streamline-emojis:four-leaf-clover"></Icon>
        输入
      </n-flex>
    </p>
    <div class="content" v-html="problem.input_description"></div>

    <p class="title" :style="style">
      <n-flex align="center">
        <Icon icon="streamline-emojis:herb"></Icon>
        输出
      </n-flex>
    </p>
    <div class="content" v-html="problem.output_description"></div>

    <div v-if="problem.hint">
      <p class="title" :style="style">
        <n-flex align="center">
          <Icon icon="streamline-emojis:seedling"></Icon>
          提示
        </n-flex>
      </p>
      <div class="content" v-html="problem.hint"></div>
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
      <div class="content" v-html="problem.source"></div>
    </div>
  </div>
</template>

<style scoped>
.problemContent {
  --border-color-light: rgb(239, 239, 245);
  --bg-code-light: rgb(250, 250, 252);
  --bg-code-dark: rgb(24, 24, 28);
  --bg-table-light: rgba(250, 250, 252, 1);
  --bg-table-dark: rgba(38, 38, 42, 1);
  --border-color-dark: rgba(255, 255, 255, 0.09);
  --blockquote-color: #7b7b7b;
  --blockquote-border: #bbbec4;
  --link-color: #18a058;
  --transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

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

.content {
  font-size: 16px;
  line-height: 2;
}

/* 针对 v-html 渲染内容的深度样式 */
.content :deep(p) {
  margin: 0;
}

.content :deep(blockquote) {
  border-left: 3px solid var(--blockquote-border);
  padding-left: 10px;
  margin: 10px 0;
  color: var(--blockquote-color);
}

.content :deep(pre) {
  width: 100%;
  background-color: var(--bg-code-light);
  border: 1px solid var(--border-color-light);
  word-break: break-word;
  box-sizing: border-box;
  transition:
    background-color var(--transition),
    border-color var(--transition);
}

.content :deep(pre code) {
  font-family: "Monaco", monospace;
}

.dark .content :deep(pre) {
  background-color: var(--bg-code-dark);
  border-color: var(--border-color-dark);
}

.content :deep(table) {
  width: 100%;
  border-spacing: 0;
  border: 1px solid var(--border-color-light);
  transition:
    background-color var(--transition),
    border-color var(--transition);
}

.content :deep(table th) {
  background-color: var(--bg-table-light);
  padding: 8px;
  transition:
    background-color var(--transition),
    border-color var(--transition);
}

.dark .content :deep(table th) {
  background-color: var(--bg-table-dark);
}

.content :deep(table td) {
  padding: 8px;
}

.content :deep(table td),
.content :deep(table th) {
  border-right: 1px solid var(--border-color-light);
  border-bottom: 1px solid var(--border-color-light);
}

.content :deep(table th:last-child),
.content :deep(table td:last-child) {
  border-right: none;
}

.content :deep(table tr:last-child td) {
  border-bottom: none;
}

.content :deep(p code) {
  font-size: 90%;
  padding: 2px 5px;
  margin: 0 4px;
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
  line-height: 1.5;
  font-family: "Monaco", monospace;
}

.content :deep(img) {
  max-width: 100%;
  height: auto !important;
}

.content :deep(a) {
  color: var(--link-color);
  text-decoration: none;
  transition: opacity var(--transition);
}

.content :deep(a:hover) {
  opacity: 0.8;
}
</style>

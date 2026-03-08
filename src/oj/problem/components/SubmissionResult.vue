<script setup lang="ts">
import { JUDGE_STATUS, SubmissionStatus } from "utils/constants"
import { submissionMemoryFormat, submissionTimeFormat } from "utils/functions"
import type { Submission } from "utils/types"
import SubmissionResultTag from "shared/components/SubmissionResultTag.vue"
import { useProblemStore } from "oj/store/problem"
import { consumeJSONEventStream } from "utils/stream"
import { MdPreview } from "md-editor-v3"
import "md-editor-v3/lib/preview.css"
import { useDark } from "@vueuse/core"

const props = defineProps<{
  submission?: Submission
}>()

const isDark = useDark()
const problemStore = useProblemStore()

// AI 提示状态
const hintContent = ref("")
const hintLoading = ref(false)
const hintError = ref("")

// 错误信息格式化
const msg = computed(() => {
  if (!props.submission) return ""

  let msg = ""
  const result = props.submission.result

  // 编译错误或运行时错误时给出提示
  if (
    result === SubmissionStatus.compile_error ||
    result === SubmissionStatus.runtime_error
  ) {
    msg += "请仔细检查，看看代码的格式是不是写错了！\n\n"
  }

  if (props.submission.statistic_info?.err_info) {
    msg += props.submission.statistic_info.err_info
  }

  return msg
})

// 是否显示AI提示区域
const showAIHint = computed(() => {
  if (!props.submission) return false
  return (
    problemStore.totalFailCount >= 3 &&
    props.submission.result !== SubmissionStatus.accepted &&
    props.submission.result !== SubmissionStatus.pending &&
    props.submission.result !== SubmissionStatus.judging &&
    props.submission.result !== SubmissionStatus.submitting
  )
})

async function fetchHint(submissionId: string) {
  hintLoading.value = true
  hintContent.value = ""
  hintError.value = ""

  try {
    const response = await fetch("/api/ai/hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submission_id: submissionId }),
    })

    await consumeJSONEventStream(response, {
      onMessage: (data: {
        type: string
        content?: string
        message?: string
      }) => {
        if (data.type === "delta" && data.content) {
          hintContent.value += data.content
        } else if (data.type === "error") {
          hintError.value = data.message || "AI 提示生成失败"
        }
      },
    })
  } catch (e: any) {
    hintError.value = e.message || "请求失败"
  } finally {
    hintLoading.value = false
  }
}

// 测试用例表格数据（只在部分通过时显示）
const infoTable = computed(() => {
  if (!props.submission?.info?.data?.length) return []

  const result = props.submission.result
  // AC、编译错误、运行时错误不显示测试用例表格
  if (
    result === SubmissionStatus.accepted ||
    result === SubmissionStatus.compile_error ||
    result === SubmissionStatus.runtime_error
  ) {
    return []
  }

  const data = props.submission.info.data
  // 只有存在失败的测试用例时才显示
  return data.some((item) => item.result === 0) ? data : []
})

// 测试用例表格列配置
const columns: DataTableColumn<Submission["info"]["data"][number]>[] = [
  { title: "测试用例", key: "test_case" },
  {
    title: "测试状态",
    key: "result",
    render: (row) => h(SubmissionResultTag, { result: row.result }),
  },
  {
    title: "占用内存",
    key: "memory",
    render: (row) => submissionMemoryFormat(row.memory),
  },
  {
    title: "执行耗时",
    key: "real_time",
    render: (row) => submissionTimeFormat(row.real_time),
  },
  { title: "信号", key: "signal" },
]
</script>

<template>
  <div v-if="submission">
    <n-alert
      :type="JUDGE_STATUS[submission.result]['type']"
      :title="JUDGE_STATUS[submission.result]['name']"
      class="mb-3"
    />
    <n-flex vertical v-if="msg || infoTable.length">
      <n-card v-if="msg" embedded class="msg">{{ msg }}</n-card>
      <n-data-table
        v-if="infoTable.length"
        striped
        :data="infoTable"
        :columns="columns"
      />
    </n-flex>

    <!-- AI 提示区域 -->
    <template v-if="showAIHint">
      <n-divider />
      <n-card size="small">
        <template #header>
          <span class="gradient-text">AI 提示</span>
        </template>
        <n-alert
          v-if="hintError"
          type="error"
          :title="hintError"
          class="mb-3"
        />
        <n-button
          v-if="!hintContent && !hintLoading"
          type="primary"
          @click="fetchHint(submission.id)"
        >
          让 AI 分析我的代码
        </n-button>
        <n-spin v-else-if="hintLoading && !hintContent" size="small" />
        <MdPreview
          v-if="hintContent"
          :model-value="hintContent"
          preview-theme="vuepress"
          :theme="isDark ? 'dark' : 'light'"
        />
      </n-card>
    </template>
  </div>
</template>

<style scoped>
.msg {
  white-space: pre;
  word-break: break-all;
  line-height: 1.5;
}

.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: bold;
}
</style>

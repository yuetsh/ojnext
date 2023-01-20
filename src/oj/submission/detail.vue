<script setup lang="ts">
import { getSubmission } from "oj/api"
import { Submission } from "utils/types"
import { JUDGE_STATUS, LANGUAGE_VALUE } from "utils/constants"
import {
  parseTime,
  submissionMemoryFormat,
  submissionTimeFormat,
} from "utils/functions"
import { DataTableColumn, NAlert, NDataTable } from "naive-ui"
import copy from "copy-text-to-clipboard"
import SubmissionResultTag from "~/shared/SubmissionResultTag.vue"

const props = defineProps<{
  submissionID: string
}>()

const submission = ref<Submission>()

async function init() {
  const res = await getSubmission(props.submissionID)
  submission.value = res.data
}

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

onMounted(init)
</script>

<template>
  <n-space vertical v-if="submission" :size="24">
    <n-alert
      :type="JUDGE_STATUS[submission.result]['type']"
      :title="JUDGE_STATUS[submission.result]['name']"
    >
      <n-space>
        <span>提交时间：{{ parseTime(submission.create_time) }}</span>
        <span>语言：{{ submission.language }}</span>
        <span>提交人 {{ submission.username }}</span>
      </n-space>
    </n-alert>
    <n-card embedded>
      <n-space justify="end">
        <n-button @click="copy(submission!.code)">复制代码</n-button>
      </n-space>
      <n-code
        class="code"
        word-wrap
        :language="LANGUAGE_VALUE[submission.language]"
        :code="submission.code"
        show-line-numbers
      />
    </n-card>
    <n-data-table :columns="columns" :data="submission.info.data" />
  </n-space>
</template>

<style scoped>
.code {
  font-size: 20px;
}
</style>

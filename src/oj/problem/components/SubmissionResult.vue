<script setup lang="ts">
import { JUDGE_STATUS, SubmissionStatus } from "utils/constants"
import { submissionMemoryFormat, submissionTimeFormat } from "utils/functions"
import type { Submission } from "utils/types"
import SubmissionResultTag from "shared/components/SubmissionResultTag.vue"

const props = defineProps<{
  submission?: Submission
}>()

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
  </div>
</template>

<style scoped>
.msg {
  white-space: pre;
  word-break: break-all;
  line-height: 1.5;
}
</style>

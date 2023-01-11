<script setup lang="ts">
import party from "party-js"
import { Ref } from "vue"
import {
  SOURCES,
  JUDGE_STATUS,
  SubmissionStatus,
} from "../../../utils/constants"
import {
  submissionMemoryFormat,
  submissionTimeFormat,
} from "../../../utils/functions"
import {
  Code,
  Problem,
  Submission,
  SubmitCodePayload,
} from "../../../utils/types"
import { getSubmission, submitCode } from "../../api"

import SubmissionResultTag from "../../components/submission-result-tag.vue"

const code = inject<Code>("code", {
  value: "",
  language: "C",
})
const problem = inject<Ref<Problem>>("problem")

const route = useRoute()
const contestID = <string>route.params.contestID || ""

const submissionId = ref("")
const submission = ref<Submission | null>(null)

const [submitted] = useToggle()

const { start: submitPending, isPending } = useTimeout(5000, {
  controls: true,
  immediate: false,
})

const { start: fetchSubmission } = useTimeoutFn(
  async () => {
    const res = await getSubmission(submissionId.value)
    submission.value = res.data
    const result = submission.value.result
    if (
      result === SubmissionStatus.judging ||
      result === SubmissionStatus.pending
    ) {
      fetchSubmission()
    } else {
      submitted.value = false
    }
  },
  2000,
  { immediate: false }
)

const judging = computed(
  () =>
    !!(submission.value && submission.value.result === SubmissionStatus.judging)
)

const pending = computed(
  () =>
    !!(submission.value && submission.value.result === SubmissionStatus.pending)
)

const submitting = computed(
  () =>
    !!(
      submission.value &&
      submission.value.result === SubmissionStatus.submitting
    )
)

const submitDisabled = computed(() => {
  const value = code.value
  if (
    value.trim() === "" ||
    value === problem!.value.template[code.language] ||
    value === SOURCES[code.language]
  ) {
    return true
  }
  if (judging.value || pending.value || submitting.value) {
    return true
  }
  if (submitted.value) {
    return true
  }
  if (isPending.value) {
    return true
  }
  return false
})

const submitLabel = computed(() => {
  if (submitting.value) {
    return "正在提交"
  }
  if (judging.value || pending.value) {
    return "正在评分"
  }
  if (isPending.value) {
    return "运行结果"
  }
  return "点击提交"
})

const msg = computed(() => {
  if (
    submission.value &&
    submission.value.statistic_info &&
    submission.value.statistic_info.err_info
  ) {
    return submission.value.statistic_info.err_info
  }
  const result = submission.value && submission.value.result
  if (
    result === SubmissionStatus.compile_error ||
    result === SubmissionStatus.runtime_error
  ) {
    return "请仔细检查，看看代码格式是不是写错了！"
  } else {
    return ""
  }
})

const infoTable = computed(() => {
  if (
    submission.value &&
    submission.value.result !== SubmissionStatus.accepted &&
    submission.value.result !== SubmissionStatus.compile_error &&
    submission.value.result !== SubmissionStatus.runtime_error &&
    submission.value.info &&
    submission.value.info.data &&
    submission.value.info.data.length
  ) {
    const data = submission.value.info.data
    if (data.some((item) => item.result === 0)) {
      return submission.value.info.data
    } else {
      return []
    }
  } else {
    return []
  }
})

async function submit() {
  const data: SubmitCodePayload = {
    problem_id: problem!.value.id,
    language: code.language,
    code: code.value,
  }
  if (contestID) {
    data.contest_id = parseInt(contestID)
  }
  submission.value = { result: 9 } as Submission
  const res = await submitCode(data)
  submissionId.value = res.data.submission_id
  // 防止重复提交
  submitPending()
  submitted.value = true
  // 查询结果
  fetchSubmission()
}

watch(
  () => submission.value && submission.value.result,
  (result) => {
    if (result === SubmissionStatus.accepted) {
      party.confetti(document.body, {
        count: party.variation.range(200, 400),
        size: party.variation.skew(2, 0.3),
      })
    }
  }
)

defineExpose({ submit })
</script>
<template>
  <el-tab-pane :disabled="submitDisabled" name="result">
    <template #label>
      <el-space :size="2">
        <el-icon>
          <i-ep-loading v-if="judging || pending || submitting" />
          <i-ep-bell v-else-if="isPending" />
          <i-ep-caret-right v-else />
        </el-icon>
        <span>{{ submitLabel }}</span>
      </el-space>
    </template>
    <div class="panel">
      <el-alert
        v-if="submission"
        :closable="false"
        :type="(JUDGE_STATUS[submission.result]['alertType'] as any)"
        :title="JUDGE_STATUS[submission.result]['name']"
      >
      </el-alert>
      <el-scrollbar
        v-if="msg || infoTable.length"
        height="280"
        class="result"
        noresize
      >
        <div v-if="msg">{{ msg }}</div>
        <el-table v-if="infoTable.length" :data="infoTable" stripe>
          <el-table-column prop="test_case" label="测试用例" align="center" />
          <el-table-column label="测试状态" width="120" align="center">
            <template #default="scope">
              <SubmissionResultTag
                v-if="scope.row"
                :result="scope.row.result"
              />
            </template>
          </el-table-column>
          <el-table-column label="占用内存" align="center">
            <template #default="scope">
              {{ submissionMemoryFormat(scope.row.memory) }}
            </template>
          </el-table-column>
          <el-table-column label="执行耗时" align="center">
            <template #default="scope">
              {{ submissionTimeFormat(scope.row.real_time) }}
            </template>
          </el-table-column>
          <el-table-column prop="signal" label="信号" align="center" />
        </el-table>
      </el-scrollbar>
    </div>
  </el-tab-pane>
</template>
<style scoped>
.panel {
  height: 320px;
}

.result {
  margin-top: 12px;
  white-space: pre;
  line-height: 1.5;
}
</style>

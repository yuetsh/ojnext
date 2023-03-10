<script setup lang="ts">
import { code } from "oj/composables/code"
import party from "party-js"
import { Ref } from "vue"
import { SOURCES, JUDGE_STATUS, SubmissionStatus } from "utils/constants"
import { submissionMemoryFormat, submissionTimeFormat } from "utils/functions"
import { Problem, Submission, SubmitCodePayload } from "utils/types"
import { getSubmission, submitCode } from "oj/api"
import SubmissionResultTag from "~/shared/SubmissionResultTag.vue"
import type { DataTableColumn } from "naive-ui"

const problem = inject<Ref<Problem>>("problem")

const route = useRoute()
const contestID = <string>route.params.contestID ?? ""

const submissionId = ref("")
const submission = ref<Submission>()
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
    return "????????????"
  }
  if (judging.value || pending.value) {
    return "????????????"
  }
  if (isPending.value) {
    return "????????????"
  }
  return "????????????"
})

const msg = computed(() => {
  let msg = ""
  const result = submission.value && submission.value.result
  if (
    result === SubmissionStatus.compile_error ||
    result === SubmissionStatus.runtime_error
  ) {
    msg += "????????????????????????????????????????????????????????????\n\n"
  }
  if (
    submission.value &&
    submission.value.statistic_info &&
    submission.value.statistic_info.err_info
  ) {
    msg += submission.value.statistic_info.err_info
  }
  return msg
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

const columns: DataTableColumn<Submission["info"]["data"][number]>[] = [
  { title: "????????????", key: "test_case" },
  {
    title: "????????????",
    key: "result",
    render: (row) => h(SubmissionResultTag, { result: row.result }),
  },
  {
    title: "????????????",
    key: "memory",
    render: (row) => submissionMemoryFormat(row.memory),
  },
  {
    title: "????????????",
    key: "real_time",
    render: (row) => submissionTimeFormat(row.real_time),
  },
  { title: "??????", key: "signal" },
]

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
  // ??????????????????
  submitPending()
  submitted.value = true
  // ????????????
  fetchSubmission()
}

watch(
  () => submission?.value?.result,
  (result) => {
    if (result === SubmissionStatus.accepted) {
      party.confetti(document.body, {
        count: party.variation.range(200, 400),
        size: party.variation.skew(2, 0.3),
      })
    }
  }
)
</script>

<template>
  <n-popover
    trigger="click"
    placement="bottom-end"
    scrollable
    :show-arrow="false"
    style="max-height: 600px"
  >
    <template #trigger>
      <n-button type="primary" :disabled="submitDisabled" @click="submit">
        <template #icon>
          <n-icon>
            <i-ep-loading v-if="judging || pending || submitting" />
            <i-ep-bell v-else-if="isPending" />
            <i-ep-caret-right v-else />
          </n-icon>
        </template>
        {{ submitLabel }}
      </n-button>
    </template>
    <template #header>
      <n-alert
        v-if="submission"
        :type="JUDGE_STATUS[submission.result]['type']"
        :title="JUDGE_STATUS[submission.result]['name']"
      />
    </template>
    <n-space vertical v-if="msg || infoTable.length">
      <n-card v-if="msg" embedded class="msg">{{ msg }}</n-card>
      <n-data-table
        v-if="infoTable.length"
        size="small"
        striped
        :data="infoTable"
        :columns="columns"
      />
    </n-space>
  </n-popover>
</template>
<style scoped>
.msg {
  white-space: pre;
  word-break: break-all;
  line-height: 1.5;
}
</style>

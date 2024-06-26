<script setup lang="ts">
import { code } from "oj/composables/code"
import { problem } from "oj/composables/problem"
import { isDesktop } from "~/shared/composables/breakpoints"
import { JUDGE_STATUS, SubmissionStatus } from "utils/constants"
import { submissionMemoryFormat, submissionTimeFormat } from "utils/functions"
import { Submission, SubmitCodePayload } from "utils/types"
import { getSubmission, submitCode } from "oj/api"
import SubmissionResultTag from "~/shared/components/SubmissionResultTag.vue"
import { useUserStore } from "~/shared/store/user"
// @ts-ignore
import confetti from "canvas-confetti"
import { Icon } from "@iconify/vue"

const userStore = useUserStore()
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
  { immediate: false },
)

const judging = computed(
  () =>
    !!(
      submission.value && submission.value.result === SubmissionStatus.judging
    ),
)

const pending = computed(
  () =>
    !!(
      submission.value && submission.value.result === SubmissionStatus.pending
    ),
)

const submitting = computed(
  () =>
    !!(
      submission.value &&
      submission.value.result === SubmissionStatus.submitting
    ),
)

const submitDisabled = computed(() => {
  if (!userStore.isAuthed) {
    return true
  }
  if (code.value.trim() === "") {
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
  if (!userStore.isAuthed) {
    return "请先登录"
  }
  if (submitting.value) {
    return "正在提交"
  }
  if (judging.value || pending.value) {
    return "正在评分"
  }
  if (isPending.value) {
    return "运行结果"
  }
  return "提交代码"
})

const msg = computed(() => {
  let msg = ""
  const result = submission.value && submission.value.result
  if (
    result === SubmissionStatus.compile_error ||
    result === SubmissionStatus.runtime_error
  ) {
    msg += "请仔细检查，看看代码的格式是不是写错了！\n\n"
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

async function submit() {
  if (!userStore.isAuthed) {
    return
  }
  const data: SubmitCodePayload = {
    problem_id: problem.value!.id,
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
  () => submission?.value?.result,
  (result) => {
    if (result === SubmissionStatus.accepted) {
      confetti({
        particleCount: 300,
        startVelocity: 30,
        gravity: 0.5,
        spread: 350,
        origin: { x: 0.5, y: 0.4 },
      })
    }
  },
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
      <n-button
        :size="isDesktop ? 'medium' : 'small'"
        type="primary"
        :disabled="submitDisabled"
        @click="submit"
      >
        <template #icon>
          <n-icon>
            <Icon
              v-if="judging || pending || submitting"
              icon="eos-icons:loading"
            ></Icon>
            <Icon v-else-if="isPending" icon="ph:lightbulb-fill"></Icon>
            <Icon v-else icon="ph:play-fill"></Icon>
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

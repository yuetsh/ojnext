<script setup lang="ts">
import { getSubmission } from "oj/api"
import {
  JUDGE_STATUS,
  LANGUAGE_FORMAT_VALUE,
  LANGUAGE_SHOW_VALUE,
} from "utils/constants"
import {
  parseTime,
  submissionMemoryFormat,
  submissionTimeFormat,
  utoa,
  copyToClipboard,
} from "utils/functions"
import { Submission } from "utils/types"
import SubmissionResultTag from "shared/components/SubmissionResultTag.vue"
import { useBreakpoints } from "shared/composables/breakpoints"

const props = defineProps<{
  submissionID: string
  problemID?: string
  submission?: Submission
  hideList?: boolean
}>()

const router = useRouter()
const message = useMessage()

const { isMobile, isDesktop } = useBreakpoints()

const submission = ref<Submission>()

async function init() {
  submission.value = props.submission
  if (submission.value) return
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
]

function copyToCat() {
  const lang = LANGUAGE_FORMAT_VALUE[submission.value!.language]
  const data = {
    lang,
    code: submission.value!.code,
    input: "",
  }
  const base64 = utoa(JSON.stringify(data))
  const url = `${import.meta.env.PUBLIC_CODE_URL}?share=${encodeURIComponent(base64)}`
  window.open(url, "_blank")
}

async function copyToProblem() {
  const success = await copyToClipboard(submission.value!.code)
  if (success) {
    message.success("代码复制成功，需要手动粘贴到题目")
  } else {
    message.error("代码复制失败")
  }

  // 判断是否是竞赛题目
  const contestID = submission.value!.contest
  if (contestID) {
    // 竞赛题目
    router.push({
      name: "contest problem",
      params: {
        contestID: String(contestID),
        problemID: props.problemID,
      },
    })
  } else {
    // 普通题目
    router.push({
      name: "problem",
      params: {
        problemID: props.problemID,
      },
    })
  }
}

onMounted(init)
</script>

<template>
  <n-flex vertical v-if="submission" :size="24">
    <n-flex :vertical="isMobile" justify="space-between">
      <n-alert
        style="flex: 1"
        :type="JUDGE_STATUS[submission.result]['type']"
        :title="JUDGE_STATUS[submission.result]['name']"
      >
        <n-flex>
          <span>提交时间：{{ parseTime(submission.create_time) }}</span>
          <span>编程语言：{{ LANGUAGE_SHOW_VALUE[submission.language] }}</span>
          <span>用户：{{ submission.username }}</span>
        </n-flex>
      </n-alert>
      <n-flex :vertical="isDesktop" justify="center">
        <n-button secondary @click="copyToCat">复制到自测猫</n-button>
        <n-button secondary @click="copyToProblem">复制回到题目</n-button>
      </n-flex>
    </n-flex>
    <n-card embedded>
      <n-code
        class="code"
        :language="LANGUAGE_FORMAT_VALUE[submission.language]"
        :code="submission.code"
        show-line-numbers
      />
    </n-card>
    <n-data-table
      v-if="!hideList && submission.info && submission.info.data"
      :columns="columns"
      :data="submission.info.data"
    />
  </n-flex>
</template>

<style scoped>
.code {
  font-size: 20px;
  overflow: auto;
}
</style>

<script setup lang="ts">
import copy from "copy-text-to-clipboard"
import { createMessage, getSubmission } from "oj/api"
import { JUDGE_STATUS, LANGUAGE_FORMAT_VALUE } from "utils/constants"
import {
  parseTime,
  submissionMemoryFormat,
  submissionTimeFormat,
} from "utils/functions"
import { Submission } from "utils/types"
import SubmissionResultTag from "~/shared/components/SubmissionResultTag.vue"
import { useUserStore } from "~/shared/store/user"

const TextEditor = defineAsyncComponent(
  () => import("~/shared/components/TextEditor.vue"),
)

const props = defineProps<{
  submissionID: string
  submission?: Submission
  hideList?: boolean
}>()

const userStore = useUserStore()
const systemMessage = useMessage()
const submission = ref<Submission>()
const message = ref<string>("")
const [copied, toggle] = useToggle()
const [showBox, toggleBox] = useToggle()
const { start } = useTimeoutFn(() => toggle(false), 1000, { immediate: false })

const canWriteMessage = computed(
  () =>
    userStore.isSuperAdmin && userStore.user!.id !== submission.value?.user_id,
)

async function init() {
  submission.value = props.submission
  if (submission.value) return
  const res = await getSubmission(props.submissionID)
  submission.value = res.data
}

function handleCopy(v: string) {
  copy(v)
  toggle(true)
  start()
}

async function sendMessage() {
  if (!message.value || message.value === "<p><br></p>") return
  const data = {
    message: message.value,
    recipient: submission.value!.user_id,
    submission: submission.value!.id,
  }
  await createMessage(data)
  systemMessage.success("消息发送成功")
  message.value = ""
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

onMounted(init)
</script>

<template>
  <n-flex vertical v-if="submission" :size="24">
    <n-alert
      :type="JUDGE_STATUS[submission.result]['type']"
      :title="JUDGE_STATUS[submission.result]['name']"
    >
      <n-flex>
        <span>提交时间：{{ parseTime(submission.create_time) }}</span>
        <span>编程语言：{{ submission.language }}</span>
        <span>用户：{{ submission.username }}</span>
      </n-flex>
    </n-alert>
    <n-card embedded>
      <n-code
        class="code"
        :language="LANGUAGE_FORMAT_VALUE[submission.language]"
        :code="submission.code"
        show-line-numbers
      />
    </n-card>
    <n-flex>
      <n-button v-if="!hideList" @click="handleCopy(submission!.code)">
        {{ copied ? "成功复制" : "复制代码" }}
      </n-button>
      <n-button v-if="canWriteMessage" @click="toggleBox(!showBox)">
        {{ showBox ? "关闭" : "打开" }}文本框
      </n-button>
      <n-button v-if="canWriteMessage && showBox" @click="sendMessage">
        发送消息
      </n-button>
    </n-flex>
    <TextEditor
      title=""
      simple
      v-if="showBox && canWriteMessage"
      v-model:value="message"
      :min-height="200"
    />
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

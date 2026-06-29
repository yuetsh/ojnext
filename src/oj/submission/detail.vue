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
} from "utils/functions"
import { Submission } from "utils/types"
import SubmissionResultTag from "shared/components/SubmissionResultTag.vue"
import { useBreakpoints } from "shared/composables/breakpoints"
import { useCodeStore } from "oj/store/code"
import storage from "utils/storage"

const props = defineProps<{
  submissionID: string
  problemID?: string
  submission?: Submission
  hideList?: boolean
}>()

// 在弹框中使用时，父组件监听此事件关闭弹框，否则弹框会挡住已更新的编辑器
const emit = defineEmits<{ copied: [] }>()

const route = useRoute()
const router = useRouter()
const codeStore = useCodeStore()

const { isMobile, isDesktop } = useBreakpoints()

const submission = ref<Submission>()
const loading = ref(false)

async function init() {
  submission.value = props.submission
  if (submission.value) return
  loading.value = true
  const res = await getSubmission(props.submissionID)
  submission.value = res.data
  loading.value = false
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

function copyToProblem() {
  const { code, language, contest } = submission.value!
  // 编辑器的 storageKey 用 display id（problem._id），等于 props.problemID，
  // 而非 submission.problem（内部数字 id）
  const contestIDForKey = contest || null
  const storageKey = `problem_${props.problemID}_contest_${contestIDForKey}_lang_${language}`
  storage.set(storageKey, code)
  // 设置语言 + 代码：localStorage 覆盖全新挂载的编辑器，
  // setCode 覆盖已挂载（同页 modal）的编辑器
  codeStore.setLanguage(language)
  codeStore.setCode(code)

  const problemSetId = (route.params.problemSetId as string) ?? ""
  if (contest) {
    router.push({
      name: "contest problem",
      params: { contestID: String(contest), problemID: props.problemID },
    })
  } else if (problemSetId) {
    router.push({
      name: "problemset problem",
      params: { problemSetId, problemID: props.problemID },
    })
  } else {
    router.push({
      name: "problem",
      params: { problemID: props.problemID },
    })
  }

  emit("copied")
}

onMounted(init)
</script>

<template>
  <n-flex vertical v-if="submission" :size="24">
    <n-flex :vertical="isMobile" justify="space-between">
      <n-alert
        style="flex: 1"
        :type="JUDGE_STATUS[submission.result]['type']"
        :title="JUDGE_STATUS[submission.result]['title']"
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
  <n-spin v-else :show="loading" class="loading-container"> </n-spin>
</template>

<style scoped>
.code {
  font-size: 20px;
  overflow: auto;
}
.loading-container {
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

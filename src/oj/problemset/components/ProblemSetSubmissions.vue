<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { getProblemSetSubmissions } from "oj/api"
import { parseTime } from "utils/functions"
import { ProblemSetSubmission } from "utils/types"
import { LANGUAGE_SHOW_VALUE } from "utils/constants"
import { renderTableTitle } from "utils/renders"
import SubmissionResultTag from "shared/components/SubmissionResultTag.vue"
import Pagination from "shared/components/Pagination.vue"
import { useBreakpoints } from "shared/composables/breakpoints"
import { usePagination } from "shared/composables/pagination"
import SubmissionDetail from "oj/submission/detail.vue"
import { NButton } from "naive-ui"

interface Props {
  problemSetId: number
}

const props = defineProps<Props>()

const { isDesktop } = useBreakpoints()
const message = useMessage()
const router = useRouter()

// 弹框状态管理
const [codePanelVisible, toggleCodePanel] = useToggle(false)
const submissionID = ref("")
const problemID = ref("")

// 显示代码弹框
function showCodePanel(id: string, problem: string) {
  submissionID.value = id
  problemID.value = problem
  toggleCodePanel(true)
}

// 使用分页 composable
const { query, clearQuery } = usePagination({
  problem_id: "",
  result: "",
  language: "",
})

const submissions = ref<ProblemSetSubmission[]>([])
const total = ref(0)
const loading = ref(false)

const columns = computed(() => {
  const baseColumns = [
    {
      title: renderTableTitle("提交时间", "noto:seven-oclock"),
      key: "submit_time",
      minWidth: 200,
      render: (row: ProblemSetSubmission) => parseTime(row.submit_time, "YYYY-MM-DD HH:mm:ss"),
    },
    {
      title: renderTableTitle("提交编号", "fluent-emoji-flat:input-numbers"),
      key: "id",
      minWidth: 200,
      render: (row: ProblemSetSubmission) => {
        return h(
          NButton,
          {
            text: true,
            type: "info",
            onClick: () => {
              showCodePanel(row.submission, row.problem.toString())
            },
          },
          () => row.submission.slice(0, 12),
        )
      },
    },
    {
      title: renderTableTitle("状态", "streamline-emojis:panda-face"),
      key: "result",
      minWidth: 140,
      render: (row: ProblemSetSubmission) => h(SubmissionResultTag, { result: row.result as any }),
    },
    {
      title: renderTableTitle("题目", "streamline-emojis:blossom"),
      key: "problem_title",
      minWidth: 300,
      render: (row: ProblemSetSubmission) => {
        return h(
          NButton,
          {
            text: true,
            type: "primary",
            onClick: () => {
              router.push(`/problem/${row.problem_id}`)
            },
          },
          () => `${row.problem_id} ${row.problem_title}`,
        )
      },
    },
    {
      title: renderTableTitle("语言", "streamline-emojis:globe-showing-europe-africa"),
      key: "language",
      minWidth: 120,
      render: (row: ProblemSetSubmission) => LANGUAGE_SHOW_VALUE[row.language as keyof typeof LANGUAGE_SHOW_VALUE] || row.language,
    },
  ]

  if (isDesktop.value) {
    baseColumns.push(
      {
        title: renderTableTitle("代码长度", "streamline-emojis:file"),
        key: "code_length",
        minWidth: 100,
        render: (row: ProblemSetSubmission) => `${row.code_length} 字符`,
      },
      {
        title: renderTableTitle("执行时间", "streamline-emojis:stopwatch"),
        key: "execution_time",
        minWidth: 100,
        render: (row: ProblemSetSubmission) => `${row.execution_time}ms`,
      },
      {
        title: renderTableTitle("内存使用", "streamline-emojis:brain"),
        key: "memory_usage",
        minWidth: 100,
        render: (row: ProblemSetSubmission) => `${row.memory_usage}KB`,
      }
    )
  }

  return baseColumns
})

async function loadSubmissions() {
  loading.value = true
  try {
    const res = await getProblemSetSubmissions(props.problemSetId, {
      ...query,
      offset: query.limit * (query.page - 1),
    })
    submissions.value = res.data.results
    total.value = res.data.total
  } catch (err: any) {
    message.error("加载提交记录失败：" + (err.data || "未知错误"))
  } finally {
    loading.value = false
  }
}

function search() {
  query.page = 1
  loadSubmissions()
}

function clear() {
  clearQuery()
  search()
}

onMounted(() => {
  loadSubmissions()
})

watch(query, loadSubmissions)
</script>

<template>
  <n-flex vertical size="large">
    <!-- 搜索表单 -->
    <n-form :show-feedback="false" inline label-placement="left">
      <n-form-item label="题目ID">
        <n-input
          v-model:value="query.problem_id"
          placeholder="输入题目ID"
          clearable
          @keyup.enter="search"
        />
      </n-form-item>
      <n-form-item label="结果">
        <n-select
          v-model:value="query.result"
          placeholder="选择结果"
          clearable
          :options="[
            { label: '通过', value: '0' },
            { label: '答案错误', value: '-1' },
            { label: '编译错误', value: '-2' },
            { label: '时间超限', value: '1' },
            { label: '内存超限', value: '3' },
            { label: '运行时错误', value: '4' },
            { label: '系统错误', value: '5' },
            { label: '等待中', value: '6' },
            { label: '评测中', value: '7' },
            { label: '部分通过', value: '8' },
          ]"
        />
      </n-form-item>
      <n-form-item label="语言">
        <n-select
          v-model:value="query.language"
          placeholder="选择语言"
          clearable
          :options="[
            { label: 'C', value: 'C' },
            { label: 'C++', value: 'C++' },
            { label: 'Java', value: 'Java' },
            { label: 'Python', value: 'Python' },
            { label: 'JavaScript', value: 'JavaScript' },
          ]"
        />
      </n-form-item>
      <n-form-item>
        <n-button @click="search" type="primary">搜索</n-button>
      </n-form-item>
      <n-form-item>
        <n-button @click="clear" quaternary>重置</n-button>
      </n-form-item>
    </n-form>

    <!-- 提交记录表格 -->
    <n-data-table
      v-if="submissions.length > 0"
      :bordered="false"
      :columns="columns"
      :data="submissions"
      :loading="loading"
    />
    <n-empty v-else-if="!loading" description="暂无提交记录" />

    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:limit="query.limit"
      v-model:page="query.page"
    />

    <!-- 代码详情弹框 -->
    <n-modal
      v-model:show="codePanelVisible"
      preset="card"
      :style="{ maxWidth: isDesktop && '70vw', maxHeight: '80vh' }"
      :content-style="{ overflow: 'auto' }"
      title="代码详情"
    >
      <SubmissionDetail
        :problemID="problemID"
        :submissionID="submissionID"
        hideList
      />
    </n-modal>
  </n-flex>
</template>

<style scoped></style>

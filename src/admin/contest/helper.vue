<script setup lang="ts">
import { NButton, NCheckbox, NSelect, NTag } from "naive-ui"
import { parseTime } from "utils/functions"
import { getACMHelperList, getContest, updateACMHelperChecked } from "../api"
import { getSubmission, getSubmissions } from "oj/api"
import SubmissionDetail from "oj/submission/detail.vue"
import { isDesktop } from "shared/composables/breakpoints"

interface Props {
  contestID: string
}

interface HelperItem {
  id: number
  username: string
  real_name: string
  problem_id: string
  problem_display_id: string
  ac_info: {
    is_ac: boolean
    ac_time: number
    error_number: number
    checked?: boolean
  }
  checked: boolean
}

const props = defineProps<Props>()
const message = useMessage()

const submissions = ref<HelperItem[]>([])
const contestStartTime = ref<Date | null>(null)
const query = reactive({
  username: "",
  problemId: "",
  checked: "all",
})

// 检查状态选项
const checkedOptions = [
  { label: "全部", value: "all" },
  { label: "已检查", value: "checked" },
  { label: "未检查", value: "unchecked" },
]

// 代码查看模态框
const [codePanel, toggleCodePanel] = useToggle(false)
const currentSubmission = ref<any>(null)

// 格式化 AC 时间（ac_time 是相对于比赛开始的秒数）
function formatACTime(relativeSeconds: number) {
  if (!contestStartTime.value) return "-"
  const acTime = new Date(
    contestStartTime.value.getTime() + relativeSeconds * 1000,
  )
  return parseTime(acTime, "YYYY-MM-DD HH:mm:ss")
}

// 切换检查状态
async function toggleChecked(item: HelperItem) {
  const newChecked = !item.checked
  try {
    await updateACMHelperChecked(
      Number(props.contestID),
      item.id,
      item.problem_id,
      newChecked,
    )
    // 更新本地状态
    item.checked = newChecked
    item.ac_info.checked = newChecked

    // 强制触发响应式更新
    submissions.value = [...submissions.value]

    message.success(newChecked ? "已标记为已检查" : "已取消标记")
  } catch (err: any) {
    message.error(err.data || "操作失败")
  }
}

// 批量标记为已检查
async function markAllAsChecked() {
  const unchecked = filteredSubmissions.value.filter((item) => !item.checked)
  if (unchecked.length === 0) {
    message.info("没有需要标记的提交")
    return
  }

  const loadingMsg = message.loading("正在标记...", { duration: 0 })
  try {
    for (const item of unchecked) {
      await updateACMHelperChecked(
        Number(props.contestID),
        item.id,
        item.problem_id,
        true,
      )
      item.checked = true
      item.ac_info.checked = true
    }

    // 强制触发响应式更新
    submissions.value = [...submissions.value]

    loadingMsg.destroy()
    message.success(`已标记 ${unchecked.length} 个提交为已检查`)
  } catch (err: any) {
    loadingMsg.destroy()
    message.error(err.data || "批量操作失败")
  }
}

// 过滤后的提交列表
const filteredSubmissions = computed(() => {
  return submissions.value.filter((item) => {
    if (query.username && !item.username.includes(query.username)) return false
    if (query.problemId && !item.problem_display_id.includes(query.problemId))
      return false
    if (query.checked === "checked" && !item.checked) return false
    if (query.checked === "unchecked" && item.checked) return false
    return true
  })
})

// 统计信息
const stats = computed(() => {
  const total = submissions.value.length
  const checked = submissions.value.filter((item) => item.checked).length
  const unchecked = total - checked
  return { total, checked, unchecked }
})

// 查看代码 - 获取该用户在该题目的 AC 提交
async function viewSubmission(item: HelperItem) {
  try {
    // 查询该用户在该竞赛该题目的 AC 提交
    const res = await getSubmissions({
      username: item.username,
      problem_id: item.problem_display_id,
      contest_id: props.contestID,
      result: "0", // ACCEPTED
      language: "",
      page: 1,
      offset: 0,
      limit: 1,
    })

    if (res.data.results.length === 0) {
      message.warning("未找到该用户的 AC 提交")
      return
    }

    // 获取提交详情
    const submissionListItem = res.data.results[0]
    const detailRes = await getSubmission(submissionListItem.id)

    // 手动添加 contest 字段（ACM模式下后端不返回此字段）
    currentSubmission.value = {
      ...detailRes.data,
      contest: Number(props.contestID),
      problem_display_id: item.problem_display_id,
    }

    toggleCodePanel(true)
  } catch (err: any) {
    message.error(err.data || "加载提交失败")
  }
}

// 加载数据
async function loadData() {
  try {
    // 先获取比赛信息，获取开始时间
    const contestRes = await getContest(props.contestID)
    contestStartTime.value = new Date(contestRes.data.start_time)

    // 再获取 AC 提交列表
    const { data } = await getACMHelperList(Number(props.contestID))
    submissions.value = data
  } catch (err: any) {
    message.error(err.data || "加载失败")
  }
}

const columns: DataTableColumn<HelperItem>[] = [
  {
    title: "用户名",
    key: "username",
    width: 150,
  },
  {
    title: "题目",
    key: "problem_display_id",
    width: 100,
    render: (row) => h(NTag, { type: "info" }, () => row.problem_display_id),
  },
  {
    title: "AC时间",
    key: "ac_time",
    width: 180,
    render: (row) => formatACTime(row.ac_info.ac_time),
  },
  {
    title: "错误次数",
    key: "error_number",
    width: 100,
    render: (row) =>
      h(
        NTag,
        {
          type: row.ac_info.error_number > 0 ? "warning" : "success",
          size: "small",
        },
        () => row.ac_info.error_number,
      ),
  },
  {
    title: "已检查",
    key: "checked",
    width: 100,
    render: (row) =>
      h(NCheckbox, {
        checked: row.checked,
        onUpdateChecked: () => toggleChecked(row),
      }),
  },
  {
    title: "操作",
    key: "actions",
    width: 100,
    render: (row) =>
      h(
        NButton,
        {
          size: "small",
          type: "primary",
          secondary: true,
          onClick: () => viewSubmission(row),
        },
        () => "查看代码",
      ),
  },
]

onMounted(loadData)
</script>

<template>
  <n-flex vertical>
    <n-flex justify="space-between" align="center">
      <n-flex align="center">
        <h2 style="margin: 0">比赛辅助检查</h2>
        <n-tag type="info" size="large"> 总计: {{ stats.total }} </n-tag>
        <n-tag type="success" size="large"> 已检查: {{ stats.checked }} </n-tag>
        <n-tag type="warning" size="large">
          未检查: {{ stats.unchecked }}
        </n-tag>
      </n-flex>
      <n-button
        type="primary"
        :disabled="stats.unchecked === 0"
        @click="markAllAsChecked"
      >
        标记全部为已检查
      </n-button>
    </n-flex>

    <n-alert type="info" style="margin-bottom: 16px">
      <template #header>使用说明</template>
      此工具用于赛后人工审核代码，检查是否存在抄袭、作弊等行为。请逐个查看通过（AC）的提交代码，检查完成后勾选"已检查"。
    </n-alert>

    <n-flex align="center" style="margin-bottom: 16px">
      <n-input
        v-model:value="query.username"
        placeholder="筛选用户名"
        style="width: 150px"
        clearable
      />
      <n-input
        v-model:value="query.problemId"
        placeholder="筛选题目"
        style="width: 150px"
        clearable
      />
      <n-select
        v-model:value="query.checked"
        :options="checkedOptions"
        style="width: 120px"
      />
    </n-flex>

    <n-data-table
      :columns="columns"
      :data="filteredSubmissions"
      :pagination="{ pageSize: 20 }"
      :bordered="false"
    />

    <n-modal
      v-model:show="codePanel"
      preset="card"
      :style="{ maxWidth: isDesktop && '70vw', maxHeight: '80vh' }"
      :content-style="{ overflow: 'auto' }"
      title="代码详情"
    >
      <SubmissionDetail
        v-if="currentSubmission"
        :submission="currentSubmission"
        :problemID="currentSubmission.problem_display_id"
        :submissionID="currentSubmission.id"
        hideList
      />
    </n-modal>
  </n-flex>
</template>

<style scoped>
:deep(.n-data-table) {
  margin-top: 16px;
}
</style>

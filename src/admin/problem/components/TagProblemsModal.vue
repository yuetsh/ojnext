<script setup lang="ts">
import { NButton, NTag } from "naive-ui"
import Pagination from "shared/components/Pagination.vue"
import type { AdminProblemFiltered } from "utils/types"
import { batchTagProblems, getProblemList } from "admin/api"

interface Props {
  show: boolean
  tagId: number
  tagName: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  "update:show": [value: boolean]
  changed: []
}>()

const router = useRouter()
const message = useMessage()

const problems = ref<AdminProblemFiltered[]>([])
const total = ref(0)
const page = ref(1)
const limit = ref(10)
const keyword = ref("")

const columns: DataTableColumn<AdminProblemFiltered>[] = [
  { title: "显示编号", key: "_id", width: 100 },
  {
    title: "标题",
    key: "title",
    minWidth: 200,
    render: (row) =>
      h(
        NButton,
        { text: true, type: "primary", onClick: () => goEdit(row) },
        () => row.title,
      ),
  },
  {
    title: "可见",
    key: "visible",
    width: 80,
    render: (row) =>
      h(
        NTag,
        { size: "small", type: row.visible ? "success" : "default" },
        () => (row.visible ? "公开" : "隐藏"),
      ),
  },
  {
    title: "选项",
    key: "actions",
    width: 110,
    render: (row) =>
      h(
        NButton,
        { size: "small", type: "error", onClick: () => removeTag(row) },
        () => "移除标签",
      ),
  },
]

async function listProblems() {
  if (page.value < 1) page.value = 1
  const offset = (page.value - 1) * limit.value
  const res = await getProblemList(
    offset,
    limit.value,
    keyword.value,
    "",
    undefined,
    props.tagId,
  )
  problems.value = res.results
  total.value = res.total
}

function close() {
  emit("update:show", false)
}

function goEdit(row: AdminProblemFiltered) {
  close()
  router.push({ name: "admin problem edit", params: { problemID: row.id } })
}

async function removeTag(row: AdminProblemFiltered) {
  await batchTagProblems([row.id], [props.tagName], "remove")
  message.success(`已移除「${row.title}」的标签`)
  emit("changed")
  // 移掉本页最后一条时退回上一页，交给下面的 watcher 重新拉取
  if (problems.value.length === 1 && page.value > 1) {
    page.value -= 1
  } else {
    listProblems()
  }
}

// 改搜索词就回到第一页
watch(keyword, () => (page.value = 1))

// 每次打开弹窗重置状态，拉取交给下面的 watcher
watch(
  () => props.show,
  (show) => {
    if (!show) return
    page.value = 1
    keyword.value = ""
  },
)

// 打开 / 翻页 / 改每页条数 / 改搜索词都走这里，防抖把同一批变更合并成一次请求
watchDebounced(
  () => [props.show, props.tagId, page.value, limit.value, keyword.value],
  () => {
    if (!props.show) return
    listProblems()
  },
  { debounce: 300, maxWait: 800 },
)
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    :title="`标签「${tagName}」下的题目`"
    style="width: 720px"
    @close="close"
  >
    <n-flex vertical size="large">
      <n-flex justify="space-between" align="center">
        <span>共 {{ total }} 道题</span>
        <n-input
          v-model:value="keyword"
          style="width: 220px"
          placeholder="输入标题关键字"
          clearable
        />
      </n-flex>
      <n-data-table striped :columns="columns" :data="problems" />
      <Pagination :total="total" v-model:limit="limit" v-model:page="page" />
    </n-flex>
  </n-modal>
</template>

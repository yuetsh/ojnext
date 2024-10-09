<template>
  <n-flex justify="space-between" class="titleWrapper">
    <h2 class="title">评论列表（只列出有内容的）</h2>
    <div>
      <n-input
        v-model:value="query.problem"
        clearable
        placeholder="输入题目序号"
      />
    </div>
  </n-flex>
  <n-data-table striped :columns="columns" :data="comments" />
  <Pagination
    :total="total"
    v-model:limit="query.limit"
    v-model:page="query.page"
  />
</template>
<script lang="ts" setup>
import { NButton } from "naive-ui"
import Pagination from "~/shared/components/Pagination.vue"
import { parseTime } from "~/utils/functions"
import { Comment } from "~/utils/types"
import { getCommentList } from "../api"
import CommentActions from "./components/CommentActions.vue"

const comments = ref<Comment[]>([])
const total = ref(0)
const query = reactive({
  limit: 10,
  page: 1,
  problem: "",
})

const columns: DataTableColumn<Comment>[] = [
  {
    title: "题目",
    key: "problem",
    width: 100,
    render: (row) =>
      h(
        NButton,
        {
          text: true,
          type: "info",
          onClick: () => window.open("/problem/" + row.problem, "_blank"),
        },
        () => row.problem,
      ),
  },
  {
    title: "提交",
    key: "submission",
    width: 200,
    render: (row) =>
      h(
        NButton,
        {
          text: true,
          type: "info",
          onClick: () => window.open("/submission/" + row.submission, "_blank"),
        },
        () => row.submission.slice(0, 12),
      ),
  },
  { title: "描述评分", key: "description_rating", width: 100 },
  { title: "难度评分", key: "difficulty_rating", width: 100 },
  { title: "综合评分", key: "comprehensive_rating", width: 100 },
  { title: "用户", key: "user.username", width: 150 },
  {
    title: "时间",
    key: "create_time",
    render: (row) => parseTime(row.create_time, "YYYY-MM-DD HH:mm:ss"),
    width: 200,
  },
  {
    title: "内容",
    key: "content",
    minWidth: 200,
    maxWidth: 300,
    ellipsis: true,
  },
  {
    title: "选项",
    key: "action",
    width: 100,
    render: (row) =>
      h(CommentActions, { commentID: row.id, onDeleted: listComments }),
  },
]

async function listComments() {
  const offset = (query.page - 1) * query.limit
  const res = await getCommentList(offset, query.limit, query.problem)
  comments.value = res.data.results
  total.value = res.data.total
}

onMounted(listComments)
watch(() => [query.page, query.limit], listComments)
watchDebounced(() => [query.problem], listComments, {
  debounce: 500,
  maxWait: 1000,
})
</script>
<style scoped>
.titleWrapper {
  margin-bottom: 16px;
}

.title {
  margin: 0;
}
</style>

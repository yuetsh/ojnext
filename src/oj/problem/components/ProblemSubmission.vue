<script lang="ts" setup>
import { useUserStore } from "~/shared/store/user"
import { Submission } from "~/utils/types"
import { parseTime } from "~/utils/functions"
import { LANGUAGE_SHOW_VALUE } from "~/utils/constants"
import { getSubmissions } from "~/oj/api"
import { isDesktop } from "~/shared/composables/breakpoints"
import SubmissionResultTag from "~/shared/SubmissionResultTag.vue"
import Pagination from "~/shared/Pagination.vue"
import { NButton } from "naive-ui"

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const columns: DataTableColumn<Submission>[] = [
  {
    title: "提交时间",
    key: "create_time",
    width: 200,
    render: (row) =>
      parseTime(
        row.create_time,
        isDesktop ? "YYYY-MM-DD HH:mm:ss" : "M-D hh:mm",
      ),
  },
  {
    title: "编号",
    key: "id",
    minWidth: 160,
    render: (row) => {
      if (row.show_link) {
        return h(
          NButton,
          {
            text: true,
            type: "info",
            onClick: () => {
              const data = router.resolve("/submission/" + row.id)
              window.open(data.href, "_blank")
            },
          },
          () => row.id.slice(0, 12),
        )
      } else {
        return row.id.slice(0, 12)
      }
    },
  },
  {
    title: "状态",
    key: "status",
    width: 140,
    render: (row) => h(SubmissionResultTag, { result: row.result }),
  },
  {
    title: "语言",
    key: "language",
    width: 100,
    render: (row) => LANGUAGE_SHOW_VALUE[row.language],
  },
]

const submissions = ref<Submission[]>([])
const total = ref(0)
const query = reactive({
  limit: 10,
  page: 1,
})

async function listSubmissions() {
  const offset = query.limit * (query.page - 1)
  const res = await getSubmissions({
    ...query,
    myself: "1",
    offset,
    problem_id: <string>route.params.problemID ?? "",
    contest_id: <string>route.params.contestID ?? "",
  })
  submissions.value = res.data.results
  total.value = res.data.total
}
onMounted(listSubmissions)
watch(query, listSubmissions)
</script>
<template>
  <n-data-table
    v-if="userStore.isAuthed"
    striped
    :columns="columns"
    :data="submissions"
  />
  <Pagination
    v-if="userStore.isAuthed"
    :total="total"
    v-model:limit="query.limit"
    v-model:page="query.page"
  />
  <n-alert type="error" v-if="!userStore.isAuthed" title="请先登录" />
</template>

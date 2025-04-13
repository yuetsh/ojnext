<script lang="ts" setup>
import { NButton } from "naive-ui"
import { getSubmissions } from "~/oj/api"
import Pagination from "~/shared/components/Pagination.vue"
import SubmissionResultTag from "~/shared/components/SubmissionResultTag.vue"
import { useConfigStore } from "~/shared/store/config"
import { useUserStore } from "~/shared/store/user"
import { LANGUAGE_SHOW_VALUE } from "~/utils/constants"
import { parseTime } from "~/utils/functions"
import { renderTableTitle } from "~/utils/renders"
import { Submission } from "~/utils/types"

const configStore = useConfigStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const columns: DataTableColumn<Submission>[] = [
  {
    title: renderTableTitle("提交时间", "noto:seven-oclock"),
    key: "create_time",
    width: 200,
    render: (row) => parseTime(row.create_time, "YYYY-MM-DD HH:mm:ss"),
  },
  {
    title: renderTableTitle("编号", "fluent-emoji-flat:input-numbers"),
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
    title: renderTableTitle("状态", "streamline-emojis:panda-face"),
    key: "status",
    width: 140,
    render: (row) => h(SubmissionResultTag, { result: row.result }),
  },
  {
    title: renderTableTitle(
      "语言",
      "streamline-emojis:globe-showing-europe-africa",
    ),
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

const showList = computed(() => {
  if (!userStore.isAuthed) return false
  else if (userStore.isSuperAdmin) return true
  else return configStore.config.submission_list_show_all
})

const errorMsg = computed(() => {
  if (!userStore.isAuthed) return "请先登录"
  else if (!configStore.config.submission_list_show_all) return "不让看了"
  else return ""
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
  <n-alert type="error" v-if="!showList" :title="errorMsg" />
  <template v-else>
    <n-data-table striped :columns="columns" :data="submissions" />
    <Pagination
      :total="total"
      v-model:limit="query.limit"
      v-model:page="query.page"
    />
  </template>
</template>

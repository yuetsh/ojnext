<script setup lang="ts">
import { DataTableColumn, NButton } from "naive-ui"
import Pagination from "~/shared/Pagination.vue"
import AcAndSubmission from "../components/AcAndSubmission.vue"
import { getContestProblems, getContestRank } from "oj/api"
import { ContestRank, ProblemFiltered } from "~/utils/types"
import { secondsToDuration } from "utils/functions"

interface Props {
  contestID: string
}

const props = defineProps<Props>()

const route = useRoute()
const router = useRouter()
const total = ref(0)
const data = ref<ContestRank[]>([])
const chart = ref<ContestRank[]>([])
const problems = ref<ProblemFiltered[]>([])

const query = reactive({
  limit: 50,
  page: 1,
})

const columns = ref<DataTableColumn<ContestRank>[]>([
  {
    title: "排名",
    key: "id",
    width: 60,
    fixed: "left",
    align: "center",
    render: (_, index) => index + (query.page - 1) * query.limit + 1,
  },
  {
    title: "用户",
    key: "username",
    width: 120,
    fixed: "left",
    align: "center",
    render: (row) =>
      h(
        NButton,
        {
          text: true,
          type: "info",
          onClick: () => router.push("/user?name=" + row.user.username),
        },
        () => row.user.username
      ),
  },
  {
    title: "正确数/总提交",
    key: "submission",
    width: 120,
    align: "center",
    render: (row) => h(AcAndSubmission, { rank: row }),
  },
  {
    title: "总时间",
    key: "total_time",
    width: 120,
    align: "center",
    render: (row) => secondsToDuration(row.total_time),
  },
])

async function listRanks() {
  const res = await getContestRank(props.contestID, {
    limit: query.limit,
    offset: query.limit * (query.page - 1),
    force_refresh: "0",
  })
  total.value = res.data.total
  data.value = res.data.results
  if (query.page === 1) {
    chart.value = data.value
  }
}

async function addColumns() {
  try {
    problems.value = await getContestProblems(props.contestID)
    problems.value.map((problem) => {
      columns.value.push({
        align: "center",
        title: () =>
          h(
            NButton,
            {
              text: true,
              type: "primary",
              onClick: () =>
                router.push({
                  name: "contest problem",
                  params: {
                    contestID: route.params.contestID,
                    problemID: problem._id,
                  },
                }),
            },
            () => problem.title
          ),
        render: (row) => {
          if (row.submission_info[problem.id]) {
            const status = row.submission_info[problem.id]
            let acTime
            let errorNumber
            if (status.is_ac) {
              acTime = h("span", secondsToDuration(status.ac_time))
            }
            if (status.error_number) {
              errorNumber = h(
                "p",
                { style: "margin: 0" },
                `(-${status.error_number})`
              )
            }
            return h("div", [acTime, errorNumber])
          }
        },
        cellProps: (row) => {
          let backgroundColor = ""
          let color = ""
          if (row.submission_info[problem.id]) {
            const status = row.submission_info[problem.id]
            if (status.is_first_ac) {
              backgroundColor = "#3c9"
              color = "#3c763d"
            } else if (status.is_ac) {
              backgroundColor = "#dff0d8"
            } else {
              backgroundColor = "#f2dede"
              color = "#a94442"
            }
          }
          return { style: { backgroundColor, color } }
        },
        key: problem.id,
        width: 150,
        ellipsis: true,
      })
    })
  } catch (err) {
    problems.value = []
  }
}

watch(() => query.page, listRanks)
watch(
  () => query.limit,
  () => {
    query.page = 1
    listRanks()
  }
)

onMounted(() => {
  listRanks()
  addColumns()
})
</script>

<template>
  <n-data-table
    striped
    :single-line="false"
    :scroll-x="1200"
    :columns="columns"
    :data="data"
  />
  <Pagination
    :total="total"
    v-model:page="query.page"
    v-model:limit="query.limit"
  />
</template>

<style scoped></style>

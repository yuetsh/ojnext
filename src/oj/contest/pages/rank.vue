<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { NButton, useThemeVars } from "naive-ui"
import { getContestProblems, getContestRank } from "oj/api"
import { secondsToDuration } from "utils/functions"
import { useContestStore } from "oj/store/contest"
import Pagination from "shared/components/Pagination.vue"
import { ContestStatus } from "utils/constants"
import { renderTableTitle } from "utils/renders"
import { ContestRank, ProblemFiltered } from "utils/types"
import AcAndSubmission from "../components/AcAndSubmission.vue"

interface Props {
  contestID: string
}

const props = defineProps<Props>()

const route = useRoute()
const router = useRouter()
const theme = useThemeVars()

const contestStore = useContestStore()

const total = ref(0)
const data = ref<ContestRank[]>([])
const chart = ref<ContestRank[]>([])
const problems = ref<ProblemFiltered[]>([])
const [autoRefresh] = useToggle()
const { resume, pause } = useIntervalFn(
  () => {
    query.page = 1
    listRanks()
  },
  10000,
  {
    immediate: false,
  },
)

const query = reactive({
  limit: 50,
  page: 1,
})

const columns = ref<DataTableColumn<ContestRank>[]>([
  {
    title: renderTableTitle("编号", "fluent-emoji-flat:input-numbers"),
    key: "id",
    width: 80,
    fixed: "left",
    align: "center",
    render: (_, index) => index + (query.page - 1) * query.limit + 1,
  },
  {
    title: renderTableTitle(
      "用户",
      "streamline-emojis:smiling-face-with-sunglasses",
    ),
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
        () => row.user.username,
      ),
  },
  {
    title: renderTableTitle(
      "正确数/总提交",
      "streamline-emojis:artist-palette",
    ),
    key: "submission",
    width: 140,
    align: "center",
    render: (row) => h(AcAndSubmission, { rank: row }),
  },
  // {
  //   title: "总时间",
  //   key: "total_time",
  //   width: 120,
  //   align: "center",
  //   render: (row) => secondsToDuration(row.total_time),
  // },
])

async function listRanks() {
  const res = await getContestRank(props.contestID, {
    limit: query.limit,
    offset: query.limit * (query.page - 1),
    force_refresh: "1",
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
              onClick: () => {
                const data = router.resolve({
                  name: "contest problem",
                  params: {
                    contestID: route.params.contestID,
                    problemID: problem._id,
                  },
                })
                window.open(data.href, "_blank")
              },
            },
            () => problem.title,
          ),
        render: (row) => {
          if (row.submission_info[problem.id]) {
            const status = row.submission_info[problem.id]
            let acTime
            let errorNumber
            if (status.is_ac) {
              acTime = h("span", secondsToDuration(status.ac_time))
            }
            if (status.is_first_ac) {
              acTime = [
                h(Icon, {
                  icon: "fluent-emoji:1st-place-medal",
                  height: 20,
                  width: 20,
                }),
                h("span", secondsToDuration(status.ac_time)),
              ]
            }
            if (status.error_number) {
              errorNumber = h(
                "span",
                { style: "margin: 0" },
                `(-${status.error_number})`,
              )
            }
            return h("div", { class: "oj-time-with-modal" }, [
              acTime,
              errorNumber,
            ])
          }
        },
        cellProps: (row) => {
          let backgroundColor = ""
          let color = theme.value.textColorBase
          if (row.submission_info[problem.id]) {
            const status = row.submission_info[problem.id]
            if (status.is_first_ac) {
              backgroundColor = theme.value.primaryColor
            } else if (status.is_ac) {
              backgroundColor = "#dff0d8"
            } else {
              backgroundColor = theme.value.warningColor
              color = theme.value.errorColor
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
  },
)
watch(autoRefresh, (checked) => (checked ? resume() : pause()))

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
  <n-space justify="end" align="center">
    <n-form
      label-placement="left"
      inline
      :show-feedback="false"
      v-if="contestStore.contestStatus === ContestStatus.underway"
    >
      <n-form-item label="开启自动刷新">
        <n-switch v-model:value="autoRefresh" />
      </n-form-item>
    </n-form>
    <Pagination
      :total="total"
      v-model:page="query.page"
      v-model:limit="query.limit"
    />
  </n-space>
</template>
<style>
.oj-time-with-modal {
  display: flex;
}
</style>

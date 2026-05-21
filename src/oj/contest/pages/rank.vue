<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { NButton, useThemeVars } from "naive-ui"
import { getContestProblems, getContestRank } from "oj/api"
import { secondsToDuration } from "utils/functions"
import { useContestStore } from "oj/store/contest"
import Pagination from "shared/components/Pagination.vue"
import { usePagination } from "shared/composables/pagination"
import { ContestStatus } from "utils/constants"
import { renderTableTitle } from "utils/renders"
import type { ContestRank, ProblemFiltered } from "utils/types"
import AcAndSubmission from "../components/AcAndSubmission.vue"
import LineChart from "../components/LineChart.vue"

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
const [autoRefresh] = useToggle(true)
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

// 使用分页 composable
const { query } = usePagination({}, { defaultLimit: 50 })

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
              color = theme.value.baseColor
            } else if (status.is_ac) {
              const success = theme.value.successColor
              backgroundColor = success + "50"
              color = theme.value.textColorBase
            } else {
              const error = theme.value.errorColor
              backgroundColor = error + "50"
              color = theme.value.textColorBase
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

// 导出弹窗
const showExportModal = ref(false)
const exportLoading = ref(false)
const exportForm = reactive({
  first: 0,
  second: 0,
  third: 0,
})

watch(
  () => total.value,
  (val) => {
    if (val > 0) {
      exportForm.first = Math.round(val * 0.1)
      exportForm.second = Math.round(val * 0.2)
      exportForm.third = Math.round(val * 0.3)
    }
  },
)

function openExportModal() {
  if (total.value > 0) {
    exportForm.first = Math.round(total.value * 0.1)
    exportForm.second = Math.round(total.value * 0.2)
    exportForm.third = Math.round(total.value * 0.3)
  }
  showExportModal.value = true
}

async function downloadExcel() {
  exportLoading.value = true
  try {
    const res = await getContestRank(props.contestID, {
      limit: total.value || 10000,
      offset: 0,
      force_refresh: "1",
    })
    const allRanks: ContestRank[] = res.data.results

    const rows = allRanks.map((rank, index) => {
      const rank1 = index + 1
      let level = ""
      if (rank1 <= exportForm.first) {
        level = "一等奖"
      } else if (rank1 <= exportForm.first + exportForm.second) {
        level = "二等奖"
      } else if (
        rank1 <=
        exportForm.first + exportForm.second + exportForm.third
      ) {
        level = "三等奖"
      } else {
        level = "参与奖"
      }
      return { 用户名: rank.user.username, 等级: level }
    })

    const csv =
      "用户名,等级\n" + rows.map((r) => `${r.用户名},${r.等级}`).join("\n")
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${contestStore.contest?.title ?? "contest"}获奖情况.csv`
    a.click()
    URL.revokeObjectURL(url)
    showExportModal.value = false
  } finally {
    exportLoading.value = false
  }
}

// 监听分页参数变化
watch([() => query.page, () => query.limit], listRanks)
watch(autoRefresh, (checked) => (checked ? resume() : pause()))

onMounted(() => {
  listRanks()
  addColumns()
})
</script>

<template>
  <!-- 排名变化图表 -->
  <LineChart :ranks="chart" :problems="problems" v-if="chart.length > 0" />

  <!-- 排名表格 -->
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
    <n-button
      v-if="contestStore.contestStatus === ContestStatus.finished"
      type="primary"
      @click="openExportModal"
    >
      导出数据
    </n-button>
    <Pagination
      :total="total"
      :limit="query.limit"
      :page="query.page"
      @update:limit="(limit: number) => (query.limit = limit)"
      @update:page="(page: number) => (query.page = page)"
    />
  </n-space>

  <n-modal v-model:show="showExportModal" preset="dialog" title="导出获奖数据">
    <n-form
      label-placement="left"
      label-width="auto"
      :show-feedback="false"
      style="margin-top: 16px"
    >
      <n-form-item label="一等奖人数" style="margin-bottom: 12px">
        <n-input-number v-model:value="exportForm.first" :min="0" />
      </n-form-item>
      <n-form-item label="二等奖人数" style="margin-bottom: 12px">
        <n-input-number v-model:value="exportForm.second" :min="0" />
      </n-form-item>
      <n-form-item label="三等奖人数">
        <n-input-number v-model:value="exportForm.third" :min="0" />
      </n-form-item>
    </n-form>
    <template #action>
      <n-button @click="showExportModal = false">取消</n-button>
      <n-button type="primary" :loading="exportLoading" @click="downloadExcel">
        下载 CSV
      </n-button>
    </template>
  </n-modal>
</template>
<style>
.oj-time-with-modal {
  display: flex;
}
</style>

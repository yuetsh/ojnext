<template>
  <n-tabs animated v-if="submissions.length && flowcharts.length">
    <n-tab-pane name="代码提交">
      <n-data-table
        v-if="submissions.length"
        striped
        :data="submissions"
        :columns="columns"
        :max-height="isDesktop ? 1500 : 500"
      />
    </n-tab-pane>
    <n-tab-pane name="流程图提交">
      <n-data-table
        v-if="flowcharts.length"
        striped
        :data="flowcharts"
        :columns="flowchartsColumns"
        :max-height="isDesktop ? 1500 : 500"
      />
    </n-tab-pane>
  </n-tabs>
  <n-data-table
    v-if="submissions.length && !flowcharts.length"
    striped
    :data="submissions"
    :columns="columns"
    :max-height="isDesktop ? 1500 : 500"
  />
</template>

<script lang="ts" setup>
import { NButton } from "naive-ui"
import TagTitle from "./TagTitle.vue"
import { FlowchartSummary, SolvedProblem } from "utils/types"
import { useAIStore } from "oj/store/ai"
import { useBreakpoints } from "shared/composables/breakpoints"
import { parseTime } from "utils/functions"

const router = useRouter()
const aiStore = useAIStore()

const { isDesktop } = useBreakpoints()

const submissions = computed(() => aiStore.detailsData.solved)
const flowcharts = computed(() => aiStore.detailsData.flowcharts)
const columns: DataTableColumn<SolvedProblem>[] = [
  {
    title: "完成的题目",
    key: "problem.title",
    render: (row) =>
      h(
        NButton,
        {
          text: true,
          onClick: () => {
            if (row.problem.contest_id) {
              router.push(
                "/contest/" +
                  row.problem.contest_id +
                  "/problem/" +
                  row.problem.display_id,
              )
            } else {
              router.push("/problem/" + row.problem.display_id)
            }
          },
        },
        () => {
          if (row.problem.contest_id) {
            return h(TagTitle, { problem: row.problem })
          } else {
            return row.problem.display_id + " " + row.problem.title
          }
        },
      ),
  },
  {
    title: () => (aiStore.detailsData.class_name ? "班级排名" : "全服排名"),
    key: "rank",
    width: 100,
    align: "center",
    render: (row) => row.rank + " / " + row.ac_count,
  },
  {
    title: "等级",
    key: "grade",
    width: 100,
    align: "center",
  },
]

const flowchartsColumns: DataTableColumn<FlowchartSummary>[] = [
  {
    title: "完成的题目",
    key: "problem_title",
    width: 300,
    render: (row) =>
      h(
        NButton,
        {
          text: true,
          onClick: () => {
            router.push("/problem/" + row.problem__id)
          },
        },
        () => `${row.problem__id} ${row.problem_title}`,
      ),
  },
  { title: "提交次数", key: "submission_count", width: 100, align: "center" },
  {
    title: "最高分",
    key: "best",
    width: 100,
    align: "center",
    render: (row) => `${row.best_score} (${row.best_grade})`,
  },
  {
    title: "最新提交时间",
    key: "latest_submission_time",
    width: 200,
    align: "center",
    render: (row) => parseTime(row.latest_submission_time),
  },
  { title: "平均分", key: "avg_score", width: 100, align: "center" },
]
</script>

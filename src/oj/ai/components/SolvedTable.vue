<template>
  <n-data-table
    v-if="solvedProblems.length"
    striped
    :data="solvedProblems"
    :columns="columns"
    :max-height="isDesktop ? 1200 : 400"
  />
</template>

<script lang="ts" setup>
import { NButton } from "naive-ui"
import TagTitle from "./TagTitle.vue"
import { SolvedProblem } from "utils/types"
import { useAIStore } from "oj/store/ai"
import { isDesktop } from "shared/composables/breakpoints"

const router = useRouter()
const aiStore = useAIStore()

const solvedProblems = computed(() => aiStore.detailsData.solved)

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
</script>

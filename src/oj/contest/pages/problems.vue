<script setup lang="ts">
import { ProblemFiltered } from "utils/types"
import ProblemStatus from "~/oj/problem/components/ProblemStatus.vue"
import { useContestStore } from "~/oj/store/contest"
import { renderTableTitle } from "~/utils/renders"

const props = defineProps<{ contestID: string }>()

const router = useRouter()
const contestStore = useContestStore()
const problemsColumns: DataTableColumn<ProblemFiltered>[] = [
  {
    title: renderTableTitle("状态", "streamline-emojis:musical-note"),
    key: "status",
    width: 100,
    render: (row) => h(ProblemStatus, { status: row.status }),
  },
  {
    title: renderTableTitle("编号", "fluent-emoji-flat:input-numbers"),
    key: "_id",
    width: 100,
  },
  {
    title: renderTableTitle("题目", "streamline-emojis:rice-ball"),
    key: "title",
    minWidth: 200,
  },
  {
    title: renderTableTitle("提交数", "streamline-emojis:clinking-beer-mugs"),
    key: "submission",
    align: "center",
    width: 120,
  },
  {
    title: renderTableTitle("通过率", "streamline-emojis:clapping-hands-1"),
    key: "rate",
    align: "center",
    width: 120,
  },
]

function rowProps(row: ProblemFiltered) {
  return {
    style: "cursor: pointer",
    onClick() {
      router.push(`/contest/${props.contestID}/problem/${row._id}`)
    },
  }
}
</script>

<template>
  <n-data-table
    striped
    :data="contestStore.problems"
    :columns="problemsColumns"
    :row-props="rowProps"
  />
</template>

<style scoped></style>

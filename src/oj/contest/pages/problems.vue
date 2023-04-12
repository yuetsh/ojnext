<script setup lang="ts">
import { ProblemFiltered } from "utils/types"
import ProblemStatus from "~/oj/problem/components/ProblemStatus.vue"
import { useContestStore } from "~/oj/store/contest"

const props = defineProps<{ contestID: string }>()

const router = useRouter()
const contestStore = useContestStore()
const problemsColumns: DataTableColumn<ProblemFiltered>[] = [
  {
    title: "状态",
    key: "status",
    width: 60,
    render: (row) => h(ProblemStatus, { status: row.status }),
  },
  { title: "编号", key: "_id", width: 60 },
  { title: "题目", key: "title", minWidth: 200 },
  { title: "总提交数", key: "submission", width: 100 },
  { title: "通过率", key: "rate", width: 100 },
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

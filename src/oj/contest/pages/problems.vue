<script setup lang="ts">
import { DataTableColumn } from "naive-ui"
import { ProblemFiltered } from "utils/types"
import ProblemStatus from "~/oj/problem/components/ProblemStatus.vue"

const props = defineProps<{
  contestID: string
  problems: ProblemFiltered[]
}>()

const router = useRouter()
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
    size="small"
    class="problems"
    :data="problems"
    :columns="problemsColumns"
    :row-props="rowProps"
    v-if="problems?.length"
  />
</template>

<style scoped></style>

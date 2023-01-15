<script setup lang="ts">
import Pagination from "~/shared/Pagination/index.vue"
import { SubmissionListPayload } from "utils/types"
import {
  submissionMemoryFormat,
  submissionTimeFormat,
  parseTime,
} from "utils/functions"
import { listSubmissions } from "oj/api"
import SubmissionResultTag from "oj/components/SubmissionResultTag.vue"

const route = useRoute()
const problemID = <string>route.query.problem
const contestID = <string>route.query.contest
const query = reactive<SubmissionListPayload>({
  page: 1,
  limit: 10,
  offset: 0,
  username: "",
  myself: "0",
  problem_id: problemID,
  contest_id: contestID,
})

const { data, isLoading, isFinished, execute } = listSubmissions(query)

onMounted(() => {
  execute()
})
</script>
<template>
  <el-table v-if="isFinished" :loading="isLoading" :data="data.results">
    <el-table-column label="提交时间" prop="create_time">
      <template #default="scope">
        {{ parseTime(scope.row.create_time, "YYYY-M-D hh:mm:ss") }}
      </template>
    </el-table-column>
    <el-table-column label="编号">
      <template #default="scope">
        {{ scope.row.id.slice(0, 12) }}
      </template>
    </el-table-column>
    <el-table-column label="状态" prop="result">
      <template #default="scope">
        <SubmissionResultTag :result="scope.row.result" />
      </template>
    </el-table-column>
    <el-table-column label="题目" prop="problem"></el-table-column>
    <el-table-column label="执行耗时">
      <template #default="scope">
        {{ submissionTimeFormat(scope.row.statistic_info.time_cost) }}
      </template>
    </el-table-column>
    <el-table-column label="占用内存">
      <template #default="scope">
        {{ submissionMemoryFormat(scope.row.statistic_info.memory_cost) }}
      </template>
    </el-table-column>
    <el-table-column label="语言" prop="language"></el-table-column>
    <el-table-column label="提交者" prop="username"></el-table-column>
  </el-table>
  <Pagination
    v-if="isFinished"
    :total="data.total"
    v-model:limit="query.limit"
    v-model:page="query.page"
  />
</template>
<style scoped></style>

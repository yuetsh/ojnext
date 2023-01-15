<script setup lang="ts">
import Pagination from "~/shared/Pagination/index.vue"
import {
  submissionMemoryFormat,
  submissionTimeFormat,
  parseTime,
  filterEmptyValue,
} from "utils/functions"
import { getSubmissions } from "oj/api"
import { isDesktop } from "~/shared/composables/breakpoints"
import SubmissionResultTag from "oj/components/SubmissionResultTag.vue"

const route = useRoute()
const router = useRouter()
const problemID = <string>route.query.problem ?? ""
const contestID = <string>route.query.contest ?? ""
const submissions = ref([])
const total = ref(0)
const query = reactive({
  page: parseInt(<string>route.query.page) || 1,
  limit: parseInt(<string>route.query.limit) || 10,
  username: <string>route.query.username ?? "",
  myself: <"1" | "0">route.query.myself,
})

async function listSubmissions() {
  query.page = parseInt(<string>route.query.page) || 1
  query.limit = parseInt(<string>route.query.limit) || 10
  query.username = <string>route.query.username ?? ""
  query.myself = <"1" | "0">route.query.myself

  if (query.page < 1) query.page = 1
  const offset = query.limit * (query.page - 1)
  const res = await getSubmissions({
    ...query,
    offset,
    problem_id: problemID,
    contest_id: contestID,
  })
  submissions.value = res.data.results
  total.value = res.data.total
}

onMounted(listSubmissions)

function routerPush() {
  router.push({
    path: route.path,
    query: filterEmptyValue(query),
  })
}

watch(() => query.page, routerPush)

watch(
  () => [query.limit, query.myself, query.username],
  () => {
    query.page = 1
    routerPush()
  }
)

watch(
  () => route.path === "/status" && route.query,
  (newVal) => {
    if (newVal) listSubmissions()
  }
)
</script>
<template>
  <el-form inline>
    <el-form-item label="提交状态">
      <el-select></el-select>
    </el-form-item>
    <el-form-item label="查看自己">
      <el-switch></el-switch>
    </el-form-item>
    <el-form-item label="搜索提交者">
      <el-input></el-input>
    </el-form-item>
  </el-form>
  <el-table :data="submissions" stripe>
    <el-table-column
      label="提交时间"
      prop="create_time"
      :width="isDesktop ? 200 : 120"
    >
      <template #default="scope">
        {{
          parseTime(
            scope.row.create_time,
            isDesktop ? "YYYY-M-D hh:mm:ss" : "M-D hh:mm"
          )
        }}
      </template>
    </el-table-column>
    <el-table-column label="编号" min-width="140">
      <template #default="scope">
        <el-link type="primary">{{ scope.row.id.slice(0, 12) }}</el-link>
      </template>
    </el-table-column>
    <el-table-column label="状态" prop="result">
      <template #default="scope">
        <SubmissionResultTag :result="scope.row.result" />
      </template>
    </el-table-column>
    <el-table-column label="题目" width="90">
      <template #default="scope">
        <el-link
          type="primary"
          @click="$router.push(`/problem/${scope.row.problem}`)"
        >
          {{ scope.row.problem }}
        </el-link>
      </template>
    </el-table-column>
    <el-table-column v-if="isDesktop" label="执行耗时" width="100">
      <template #default="scope">
        {{ submissionTimeFormat(scope.row.statistic_info.time_cost) }}
      </template>
    </el-table-column>
    <el-table-column v-if="isDesktop" label="占用内存" width="100">
      <template #default="scope">
        {{ submissionMemoryFormat(scope.row.statistic_info.memory_cost) }}
      </template>
    </el-table-column>
    <el-table-column label="语言" prop="language" width="100"></el-table-column>
    <el-table-column label="提交者" min-width="120">
      <template #default="scope">
        <el-link type="primary">{{ scope.row.username }}</el-link>
      </template>
    </el-table-column>
  </el-table>
  <Pagination
    :total="total"
    v-model:limit="query.limit"
    v-model:page="query.page"
  />
</template>
<style scoped></style>

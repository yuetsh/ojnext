<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRoute } from "vue-router"
import Editor from "./components/editor.vue"
import { getProblem } from "../api"
import ProblemContent from "./components/problem-content.vue"
import ProblemInfo from "./components/problem-info.vue"

const route = useRoute()
const contestID = route.params.contestID as string
const problemID = route.params.problemID as string

const problem = ref({
  _id: 0,
  created_by: {},
  io_mode: {},
  languages: [],
  samples: [],
  statistic_info: {},
  tags: [],
  template: {},
})

async function init() {
  const res = await getProblem(problemID)
  problem.value = res.data
}

onMounted(() => {
  init()
})
</script>

<template>
  <el-row v-if="problem._id">
    <el-col :span="14">
      <el-tabs type="border-card">
        <el-tab-pane label="题目描述">
          <ProblemContent :problem="problem" />
        </el-tab-pane>
        <el-tab-pane label="比赛信息" v-if="contestID"></el-tab-pane>
        <el-tab-pane label="题目信息">
          <ProblemInfo :problem="problem" />
        </el-tab-pane>
        <el-tab-pane label="提交情况">3</el-tab-pane>
      </el-tabs>
    </el-col>
    <el-col :span="10">
      <Editor :languages="problem.languages" :template="problem.template" />
    </el-col>
  </el-row>
</template>

<style scoped></style>

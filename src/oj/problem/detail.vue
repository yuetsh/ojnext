<script setup lang="ts">
import Editor from "./components/editor.vue"
import ProblemContent from "./components/problem-content.vue"
import ProblemInfo from "./components/problem-info.vue"
import { getProblem } from "../api"
import { isDesktop, isMobile } from "../../utils/breakpoints"

const { problemID = "", contestID = "" } = defineProps<{
  problemID?: string
  contestID?: string
}>()
const { data: problem, isFinished } = getProblem(problemID)
</script>

<template>
  <el-row v-if="isFinished && problem">
    <el-col :span="isDesktop ? 12 : 24">
      <el-tabs type="border-card">
        <el-tab-pane label="题目描述">
          <el-scrollbar v-if="isDesktop" height="calc(100vh - 171px)" noresize>
            <ProblemContent :problem="problem" />
          </el-scrollbar>
          <ProblemContent v-else :problem="problem" />
        </el-tab-pane>
        <el-tab-pane v-if="isMobile" label="代码编辑" lazy>
          <Editor :problem="problem" />
        </el-tab-pane>
        <el-tab-pane label="比赛信息" v-if="contestID" lazy></el-tab-pane>
        <el-tab-pane label="题目信息" lazy>
          <ProblemInfo :problem="problem" />
        </el-tab-pane>
        <el-tab-pane label="提交情况">3</el-tab-pane>
      </el-tabs>
    </el-col>
    <el-col v-if="isDesktop" :span="12" class="editorWrapper">
      <Editor :problem="problem" />
    </el-col>
  </el-row>
</template>

<style scoped>
.editorWrapper {
  height: calc(100vh - 171px);
}
</style>

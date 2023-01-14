<script setup lang="ts">
import Editor from "./components/Editor.vue"
import ProblemContent from "./components/ProblemContent.vue"
import ProblemInfo from "./components/ProblemInfo.vue"
import { getProblem } from "oj/api"
import { isDesktop, isMobile } from "~/shared/composables/breakpoints"
import { TabsPaneContext } from "element-plus"

interface Props {
  problemID: string
  contestID?: string
}

const props = withDefaults(defineProps<Props>(), {
  contestID: "",
})

const { data: problem, isFinished } = getProblem(props.problemID)
provide("problem", readonly(problem))
</script>

<template>
  <el-row v-if="isFinished && problem" :gutter="20">
    <el-col :span="isDesktop ? 12 : 24">
      <el-tabs type="border-card">
        <el-tab-pane label="题目描述">
          <el-scrollbar v-if="isDesktop" height="calc(100vh - 171px)">
            <ProblemContent :problem="problem" />
          </el-scrollbar>
          <ProblemContent v-else :problem="problem" />
        </el-tab-pane>
        <el-tab-pane v-if="isMobile" label="代码编辑" lazy>
          <Editor :problem="problem" />
        </el-tab-pane>
        <el-tab-pane label="比赛信息" v-if="props.contestID" lazy></el-tab-pane>
        <el-tab-pane label="题目信息" lazy>
          <ProblemInfo :problem="problem" />
        </el-tab-pane>
      </el-tabs>
    </el-col>
    <el-col v-if="isDesktop" :span="12">
      <Editor :problem="problem" />
    </el-col>
  </el-row>
</template>

<style scoped></style>

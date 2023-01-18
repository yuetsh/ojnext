<script setup lang="ts">
import { getProblem } from "oj/api"
import { isDesktop, isMobile } from "~/shared/composables/breakpoints"

const Editor = defineAsyncComponent(() => import("./components/Editor.vue"))
const Panel = defineAsyncComponent(() => import("./components/Panel.vue"))
const ProblemContent = defineAsyncComponent(
  () => import("./components/ProblemContent.vue")
)
const ProblemInfo = defineAsyncComponent(
  () => import("./components/ProblemInfo.vue")
)

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
  <n-grid v-if="isFinished && problem" x-gap="16" :cols="2">
    <n-gi :span="isDesktop ? 1 : 2">
      <n-tabs default-value="content">
        <n-tab-pane name="content" tab="题目描述">
          <n-scrollbar v-if="isDesktop" style="max-height: calc(100vh - 136px)">
            <ProblemContent :problem="problem" />
          </n-scrollbar>
          <ProblemContent v-else :problem="problem" />
        </n-tab-pane>
        <n-tab-pane v-if="isMobile" name="editor" tab="代码编辑">
          <Editor :problem="problem" />
          <Panel />
        </n-tab-pane>
        <n-tab-pane
          name="contest"
          tab="比赛信息"
          v-if="props.contestID"
        ></n-tab-pane>
        <n-tab-pane name="info" tab="题目信息">
          <ProblemInfo :problem="problem" />
        </n-tab-pane>
      </n-tabs>
    </n-gi>
    <n-gi v-if="isDesktop">
      <Editor :problem="problem" />
      <Panel />
    </n-gi>
  </n-grid>
</template>

<style scoped></style>

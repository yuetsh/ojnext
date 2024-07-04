<script setup lang="ts">
import { getProblem } from "oj/api"
import { isDesktop } from "~/shared/composables/breakpoints"
import { screenMode } from "~/shared/composables/switchScreen"
import { problem } from "../composables/problem"
import { ScreenMode } from "utils/constants"

const Editor = defineAsyncComponent(() => import("./components/Editor.vue"))
const EditorWithTest = defineAsyncComponent(() => import("./components/EditorWithTest.vue"))
const ProblemContent = defineAsyncComponent(
  () => import("./components/ProblemContent.vue"),
)
const ProblemInfo = defineAsyncComponent(
  () => import("./components/ProblemInfo.vue"),
)
const ProblemSubmission = defineAsyncComponent(
  () => import("./components/ProblemSubmission.vue"),
)
const ProblemComment = defineAsyncComponent(
  () => import("./components/ProblemComment.vue"),
)

interface Props {
  problemID: string
  contestID?: string
}

const props = withDefaults(defineProps<Props>(), {
  contestID: "",
})

const errMsg = ref("无数据")

const bothAndProblem = computed(
  () =>
    screenMode.value === ScreenMode.both ||
    screenMode.value === ScreenMode.problem,
)

async function init() {
  try {
    const res = await getProblem(props.problemID, props.contestID)
    problem.value = res.data
  } catch (err: any) {
    problem.value = null
    if (err.data === "Contest has not started yet.") {
      errMsg.value = "比赛还没有开始"
    }
  }
}
onMounted(init)
onBeforeUnmount(() => {
  problem.value = null
  errMsg.value = "无数据"
})
</script>

<template>
  <n-grid
    v-if="problem"
    x-gap="16"
    :cols="screenMode === ScreenMode.both ? 2 : 1"
  >
    <n-gi :span="isDesktop ? 1 : 2" v-if="bothAndProblem">
      <n-scrollbar v-if="isDesktop" style="max-height: calc(100vh - 92px)">
        <n-tabs default-value="content" type="segment">
          <n-tab-pane name="content" tab="题目描述">
            <ProblemContent />
          </n-tab-pane>
          <n-tab-pane v-if="!props.contestID" name="comment" tab="题目点评">
            <ProblemComment />
          </n-tab-pane>
          <n-tab-pane name="info" tab="题目统计">
            <ProblemInfo />
          </n-tab-pane>
          <n-tab-pane name="submission" tab="我的提交">
            <ProblemSubmission />
          </n-tab-pane>
        </n-tabs>
      </n-scrollbar>
      <n-tabs v-else default-value="content" type="segment">
        <n-tab-pane name="content" tab="题目描述">
          <ProblemContent />
        </n-tab-pane>
        <n-tab-pane name="editor" tab="代码编辑">
          <Editor />
        </n-tab-pane>
        <n-tab-pane v-if="!props.contestID" name="comment" tab="题目点评">
          <ProblemComment />
        </n-tab-pane>
        <n-tab-pane name="info" tab="题目统计">
          <ProblemInfo />
        </n-tab-pane>
        <n-tab-pane name="submission" tab="我的提交">
          <ProblemSubmission />
        </n-tab-pane>
      </n-tabs>
    </n-gi>
    <n-gi v-if="isDesktop && screenMode === ScreenMode.both">
      <Editor/>
    </n-gi>
    <n-gi v-if="isDesktop && screenMode === ScreenMode.code">
      <EditorWithTest />
    </n-gi>
  </n-grid>
  <n-empty v-else :description="errMsg"></n-empty>
</template>

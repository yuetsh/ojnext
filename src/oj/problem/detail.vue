<script setup lang="ts">
import { getProblem } from "oj/api"
import { isDesktop } from "~/shared/composables/breakpoints"
import { problem } from "../composables/problem"

const Editor = defineAsyncComponent(() => import("./components/Editor.vue"))
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

const errMsg = ref("无数据")

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
  <n-grid v-if="problem" x-gap="16" :cols="2">
    <n-gi :span="isDesktop ? 1 : 2">
      <n-scrollbar v-if="isDesktop" style="max-height: calc(100vh - 92px)">
        <n-tabs default-value="content" type="segment">
          <n-tab-pane name="content" tab="题目描述">
            <ProblemContent />
          </n-tab-pane>
          <n-tab-pane name="info" tab="题目统计">
            <ProblemInfo />
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
        <n-tab-pane name="info" tab="题目统计">
          <ProblemInfo />
        </n-tab-pane>
      </n-tabs>
    </n-gi>
    <n-gi v-if="isDesktop">
      <Editor />
    </n-gi>
  </n-grid>
  <n-empty v-else :description="errMsg"></n-empty>
</template>

<style scoped></style>

<script setup lang="ts">
import { getProblem } from "oj/api"
import { ScreenMode } from "utils/constants"
import { isDesktop, isMobile } from "~/shared/composables/breakpoints"
import {
  bothAndProblem,
  resetScreenMode,
  screenMode,
} from "~/shared/composables/switchScreen"
import { problem } from "../composables/problem"

const ProblemEditor = defineAsyncComponent(
  () => import("./components/ProblemEditor.vue"),
)
const ContestEditor = defineAsyncComponent(
  () => import("./components/ContestEditor.vue"),
)
const EditorWithTest = defineAsyncComponent(
  () => import("./components/EditorWithTest.vue"),
)
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
const route = useRoute()
const router = useRouter()

const tabOptions = computed(() => {
  const options: string[] = ["content"]
  if (isMobile.value) {
    options.push("editor")
  }
  options.push("info")
  if (!props.contestID) {
    options.push("comment")
  }
  options.push("submission")
  return options
})

const currentTab = ref("content")

const shouldUseProblemEditor = computed(() => route.name === "problem")

watch(
  [() => route.query.tab, () => tabOptions.value],
  ([rawTab]) => {
    const tabs = tabOptions.value
    const fallback = tabs[0] ?? "content"
    currentTab.value = tabs.includes(rawTab as string)
      ? (rawTab as string)
      : fallback
  },
  { immediate: true },
)

watch(currentTab, (tab) => {
  if (!tabOptions.value.includes(tab) || route.query.tab === tab) return
  router.replace({
    query: { ...route.query, tab },
  })
})

async function init() {
  resetScreenMode()
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
  resetScreenMode()
})

watch(isMobile, (value) => {
  if (value) resetScreenMode()
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
        <n-tabs v-model:value="currentTab" type="segment">
          <n-tab-pane name="content" tab="题目描述">
            <ProblemContent />
          </n-tab-pane>
          <n-tab-pane name="info" tab="题目统计">
            <ProblemInfo />
          </n-tab-pane>
          <n-tab-pane v-if="!props.contestID" name="comment" tab="题目点评">
            <ProblemComment />
          </n-tab-pane>
          <n-tab-pane name="submission" tab="我的提交">
            <ProblemSubmission />
          </n-tab-pane>
        </n-tabs>
      </n-scrollbar>
      <n-tabs v-else v-model:value="currentTab" type="segment">
        <n-tab-pane name="content" tab="描述">
          <ProblemContent />
        </n-tab-pane>
        <n-tab-pane name="editor" tab="编辑">
          <ProblemEditor v-if="shouldUseProblemEditor" />
          <ContestEditor v-else />
        </n-tab-pane>
        <n-tab-pane name="info" tab="统计">
          <ProblemInfo />
        </n-tab-pane>
        <n-tab-pane v-if="!props.contestID" name="comment" tab="点评">
          <ProblemComment />
        </n-tab-pane>
        <n-tab-pane name="submission" tab="提交">
          <ProblemSubmission />
        </n-tab-pane>
      </n-tabs>
    </n-gi>
    <n-gi v-if="isDesktop && screenMode === ScreenMode.both">
      <ProblemEditor v-if="shouldUseProblemEditor" />
      <ContestEditor v-else />
    </n-gi>
    <n-gi v-if="isDesktop && screenMode === ScreenMode.code">
      <EditorWithTest />
    </n-gi>
  </n-grid>
  <n-empty v-else :description="errMsg"></n-empty>
</template>

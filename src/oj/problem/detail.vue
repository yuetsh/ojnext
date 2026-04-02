<script setup lang="ts">
import { getProblem } from "oj/api"
import { useBreakpoints } from "shared/composables/breakpoints"
import { storeToRefs } from "pinia"
import { useProblemStore } from "oj/store/problem"
import { useScreenModeStore } from "shared/store/screenMode"

const ProblemEditor = defineAsyncComponent(
  () => import("./components/ProblemEditor.vue"),
)
const ContestEditor = defineAsyncComponent(
  () => import("./components/ContestEditor.vue"),
)
const EditorForTest = defineAsyncComponent(
  () => import("./components/EditorForTest.vue"),
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
const ProblemFlowchart = defineAsyncComponent(
  () => import("./components/ProblemFlowchart.vue"),
)

interface Props {
  problemID: string
  contestID?: string
  problemSetId?: string
}

const props = withDefaults(defineProps<Props>(), {
  contestID: "",
  problemSetId: "",
})

const errMsg = ref("无数据")
const route = useRoute()
const router = useRouter()

const problemStore = useProblemStore()
const screenModeStore = useScreenModeStore()
const { problem } = storeToRefs(problemStore)
const { shouldShowProblem } = storeToRefs(screenModeStore)

const { isMobile, isDesktop } = useBreakpoints()

const tabOptions = computed(() => {
  const options: string[] = ["content"]
  if (problem.value?.show_flowchart) {
    options.push("flowchart")
  }
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

const inProblem = computed(() => route.name === "problem")

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
  screenModeStore.resetScreenMode()
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
watch(() => props.problemID, init)
onBeforeUnmount(() => {
  problem.value = null
  errMsg.value = "无数据"
  screenModeStore.resetScreenMode()
})

watch(isMobile, (value) => {
  if (value) screenModeStore.resetScreenMode()
})
</script>

<template>
  <template v-if="problem">
    <n-split
      v-if="isDesktop && screenModeStore.isBothMode"
      direction="horizontal"
      :default-size="0.43"
      :min="0.2"
      :max="0.8"
      style="height: calc(100vh - 92px)"
    >
      <template #1>
        <n-scrollbar style="height: 100%">
          <n-tabs v-model:value="currentTab" type="segment">
            <n-tab-pane name="content" tab="题目描述">
              <ProblemContent />
            </n-tab-pane>
            <n-tab-pane
              v-if="problem.show_flowchart && problem.mermaid_code"
              name="flowchart"
              tab="流程图表"
            >
              <ProblemFlowchart />
            </n-tab-pane>
            <n-tab-pane
              name="info"
              tab="题目统计"
              :disabled="!!props.problemSetId"
            >
              <ProblemInfo />
            </n-tab-pane>
            <n-tab-pane
              v-if="!props.contestID"
              name="comment"
              tab="题目点评"
              :disabled="!!props.problemSetId"
            >
              <ProblemComment />
            </n-tab-pane>
            <n-tab-pane
              name="submission"
              tab="我的提交"
              :disabled="!!props.problemSetId"
            >
              <ProblemSubmission />
            </n-tab-pane>
          </n-tabs>
        </n-scrollbar>
      </template>
      <template #2>
        <component :is="inProblem ? ProblemEditor : ContestEditor" />
      </template>
    </n-split>

    <!-- Desktop: code only mode -->
    <template v-else-if="isDesktop && screenModeStore.isCodeOnlyMode">
      <EditorForTest />
    </template>

    <!-- Desktop: problem only mode -->
    <template v-else-if="isDesktop && shouldShowProblem">
      <n-scrollbar style="max-height: calc(100vh - 92px)">
        <n-tabs v-model:value="currentTab" type="segment">
          <n-tab-pane name="content" tab="题目描述">
            <ProblemContent />
          </n-tab-pane>
          <n-tab-pane
            v-if="problem.show_flowchart && problem.mermaid_code"
            name="flowchart"
            tab="流程图表"
          >
            <ProblemFlowchart />
          </n-tab-pane>
          <n-tab-pane
            name="info"
            tab="题目统计"
            :disabled="!!props.problemSetId"
          >
            <ProblemInfo />
          </n-tab-pane>
          <n-tab-pane
            v-if="!props.contestID"
            name="comment"
            tab="题目点评"
            :disabled="!!props.problemSetId"
          >
            <ProblemComment />
          </n-tab-pane>
          <n-tab-pane
            name="submission"
            tab="我的提交"
            :disabled="!!props.problemSetId"
          >
            <ProblemSubmission />
          </n-tab-pane>
        </n-tabs>
      </n-scrollbar>
    </template>

    <!-- Mobile -->
    <n-tabs v-else v-model:value="currentTab" type="segment">
      <n-tab-pane name="content" tab="描述">
        <ProblemContent />
      </n-tab-pane>
      <n-tab-pane v-if="problem.show_flowchart" name="flowchart" tab="流程">
        <ProblemFlowchart />
      </n-tab-pane>
      <n-tab-pane name="editor" tab="代码">
        <component :is="inProblem ? ProblemEditor : ContestEditor" />
      </n-tab-pane>
      <n-tab-pane name="info" tab="统计" :disabled="!!props.problemSetId">
        <ProblemInfo />
      </n-tab-pane>
      <n-tab-pane
        v-if="!props.contestID"
        name="comment"
        tab="点评"
        :disabled="!!props.problemSetId"
      >
        <ProblemComment />
      </n-tab-pane>
      <n-tab-pane name="submission" tab="提交" :disabled="!!props.problemSetId">
        <ProblemSubmission />
      </n-tab-pane>
    </n-tabs>
  </template>
  <n-empty v-else :description="errMsg"></n-empty>
</template>

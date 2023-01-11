<script setup lang="ts">
import { TabsPaneContext } from "element-plus"
import { Ref } from "vue"
import { Problem } from "../../../utils/types"
import { submissionExists } from "../../api"
import SubmitPanel from "./submit-panel.vue"
import TestcasePanel from "./testcase-panel.vue"

const tab = ref("test")
const submitPanelRef = ref<{ submit: Function }>()
const problem = inject<Ref<Problem>>("problem")
const [tried] = useToggle()

onMounted(() => {
  checkIfTried()
})

async function checkIfTried() {
  const res = await submissionExists(problem!.value.id)
  tried.value = res.data
}

function onTab(pane: TabsPaneContext) {
  if (pane.paneName === "submit") {
    submitPanelRef && submitPanelRef.value!.submit()
  }
}
</script>

<template>
  <el-tabs type="border-card" @tab-click="onTab" v-model="tab">
    <TestcasePanel />
    <SubmitPanel ref="submitPanelRef" />
  </el-tabs>
</template>

<style scoped></style>

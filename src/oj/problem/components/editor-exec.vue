<script setup lang="ts">
import { useToggle } from "@vueuse/core"
import { TabsPaneContext } from "element-plus"
import { inject, onMounted, Ref, ref } from "vue"
import { Problem } from "../../../utils/types"
import { submissionExists } from "../../api"
import SubmitPanel from "./submit-panel.vue"

const tab = ref("testcase")
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
  if (pane.paneName === "result") {
    submitPanelRef && submitPanelRef.value!.submit()
  }
}
</script>

<template>
  <el-tabs type="border-card" @tab-click="onTab" v-model="tab">
    <el-tab-pane label="测试用例" name="testcase">
      <div class="panel">
        <el-table height="320"></el-table>
      </div>
    </el-tab-pane>
    <SubmitPanel ref="submitPanelRef" />
  </el-tabs>
</template>

<style scoped></style>

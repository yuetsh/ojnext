<script lang="ts" setup>
import { LANGUAGE_LABEL, SOURCES } from "../../../utils/constants"
import { Problem } from "../../../utils/types"
import { useCodeStore } from "../../stores/code"
import { submissionExists } from "../../api"
import { TabsPaneContext } from "element-plus"

import Monaco from "../../../shared/monaco/index.vue"
import SubmitPanel from "./SubmitPanel.vue"
import TestcasePanel from "./TestcasePanel.vue"

interface Props {
  problem: Problem
}

const props = defineProps<Props>()

const { code } = useCodeStore()

code.language = props.problem.languages[0] || "C"
code.value = props.problem.template[code.language] || SOURCES[code.language]

const tab = ref("test")
const submitPanelRef = ref<{ submit: Function }>()
const [tried] = useToggle()

watch(() => code.language, reset)

function reset() {
  code.value = props.problem.template[code.language] || SOURCES[code.language]
}

function change(value: string) {
  code.value = value
}

onMounted(() => {
  checkIfTried()
})

async function checkIfTried() {
  const res = await submissionExists(props.problem.id)
  tried.value = res.data
}

function onTab(pane: TabsPaneContext) {
  if (pane.paneName === "submit") {
    submitPanelRef && submitPanelRef.value!.submit()
  }
}
</script>

<template>
  <el-form inline>
    <el-form-item label="语言" label-width="60">
      <el-select v-model="code.language" class="language">
        <el-option
          v-for="item in problem.languages"
          :key="item"
          :value="item"
          :label="LANGUAGE_LABEL[item]"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button @click="reset">重置</el-button>
    </el-form-item>
  </el-form>
  <Monaco
    class="editor"
    :language="code.language"
    :value="code.value"
    height="calc(100vh - 621px)"
    @change="change"
  />
  <el-tabs type="border-card" @tab-click="onTab" v-model="tab">
    <TestcasePanel />
    <SubmitPanel ref="submitPanelRef" />
  </el-tabs>
</template>

<style scoped>
.language {
  width: 100px;
}

.editor {
  min-height: 200px;
}
</style>

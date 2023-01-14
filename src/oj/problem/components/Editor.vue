<script lang="ts" setup>
import { TabsPaneContext } from "element-plus"
import { SOURCES } from "utils/constants"
import { Problem } from "utils/types"
import Monaco from "~/shared/Monaco/index.vue"
import { useCodeStore } from "oj/store/code"

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

watch(() => code.language, reset)

function reset() {
  code.value = props.problem.template[code.language] || SOURCES[code.language]
}

function change(value: string) {
  code.value = value
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
        <el-option v-for="item in problem.languages" :key="item" :value="item">
          <img class="logo" :src="`/${item}.svg`" alt="logo" />&nbsp;&nbsp;
          <span>{{ item }}</span>
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button @click="reset">重置</el-button>
      <el-button @click="$router.push(`/status?problem=${problem.id}`)">
        提交信息
      </el-button>
    </el-form-item>
  </el-form>
  <Monaco
    class="editor"
    :language="code.language"
    :value="code.value"
    @change="change"
    height="calc(100vh - 621px)"
  />
  <el-tabs type="border-card" @tab-click="onTab" v-model="tab">
    <TestcasePanel />
    <SubmitPanel ref="submitPanelRef" />
  </el-tabs>
</template>

<style scoped>
.language {
  width: 110px;
}

.editor {
  min-height: 200px;
}

.logo {
  width: 12px;
}
</style>

<script lang="ts" setup>
import { SOURCES } from "utils/constants"
import { Problem } from "utils/types"
import { code } from "oj/composables/code"
import { isDesktop } from "~/shared/composables/breakpoints"
import Form from "./Form.vue"

const CodeEditor = defineAsyncComponent(() => import("~/shared/CodeEditor.vue"))

interface Props {
  problem: Problem
}

const props = defineProps<Props>()

code.language = props.problem.languages[0] || "C"
code.value = props.problem.template[code.language] || SOURCES[code.language]

const editorHeight = computed(() =>
  isDesktop.value ? "calc(100vh - 133px)" : "calc(100vh - 180px)"
)
</script>

<template>
  <n-space vertical>
    <Form :problem="props.problem" />
    <CodeEditor
      v-model="code.value"
      :language="code.language"
      :height="editorHeight"
    />
  </n-space>
</template>

<style scoped></style>

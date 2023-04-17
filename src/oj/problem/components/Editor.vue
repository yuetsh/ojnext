<script lang="ts" setup>
import { SOURCES } from "utils/constants"
import { code } from "oj/composables/code"
import { isDesktop } from "~/shared/composables/breakpoints"
import { problem } from "oj/composables/problem"

const Form = defineAsyncComponent(() => import("./Form.vue"))
const CodeEditor = defineAsyncComponent(() => import("~/shared/CodeEditor.vue"))

code.language = problem.value!.languages[0] || "C"
code.value = problem.value!.template[code.language] || SOURCES[code.language]

const editorHeight = computed(() =>
  isDesktop.value ? "calc(100vh - 133px)" : "calc(100vh - 172px)"
)
</script>

<template>
  <n-space vertical>
    <Form />
    <CodeEditor
      v-model="code.value"
      :language="code.language"
      :height="editorHeight"
    />
  </n-space>
</template>

<style scoped></style>

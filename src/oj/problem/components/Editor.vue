<script lang="ts" setup>
import { SOURCES } from "utils/constants"
import { Problem } from "utils/types"
import Monaco from "~/shared/Monaco.vue"
import { code } from "oj/composables/code"
import { isDesktop } from "~/shared/composables/breakpoints"
import Form from "./Form.vue"

interface Props {
  problem: Problem
}

const props = defineProps<Props>()

code.language = props.problem.languages[0] || "C"
code.value = props.problem.template[code.language] || SOURCES[code.language]

function change(value: string) {
  code.value = value
}

const editorHeight = computed(() =>
  isDesktop.value ? "calc(100vh - 150px)" : "calc(100vh - 200px)"
)
</script>

<template>
  <Form :problem="props.problem" />
  <Monaco
    class="editor"
    :language="code.language"
    :value="code.value"
    @change="change"
    :height="editorHeight"
  />
</template>

<style scoped>
.editor {
  min-height: 200px;
}
</style>

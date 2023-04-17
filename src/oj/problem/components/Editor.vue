<script lang="ts" setup>
import { SOURCES } from "utils/constants"
import { code } from "oj/composables/code"
import { isDesktop } from "~/shared/composables/breakpoints"
import { problem } from "oj/composables/problem"
import storage from "~/utils/storage"
import { LANGUAGE } from "~/utils/types"

const Form = defineAsyncComponent(() => import("./Form.vue"))
const CodeEditor = defineAsyncComponent(() => import("~/shared/CodeEditor.vue"))

const route = useRoute()
const contestID = !!route.params.contestID ? route.params.contestID : null

const storageKey = computed(
  () => `problem_${problem.value!._id}_contest_${contestID}`
)

onMounted(() => {
  if (storage.get(storageKey.value)) {
    code.value = storage.get(storageKey.value)
  } else {
    code.value =
      problem.value!.template[code.language] || SOURCES[code.language]
  }
})

const editorHeight = computed(() =>
  isDesktop.value ? "calc(100vh - 133px)" : "calc(100vh - 172px)"
)

function reset() {
  storage.remove(storageKey.value)
}

function changeCode(v: string) {
  storage.set(storageKey.value, v)
}
</script>

<template>
  <n-space vertical>
    <Form @reset="reset" />
    <CodeEditor
      v-model="code.value"
      @update:model-value="changeCode"
      :language="code.language"
      :height="editorHeight"
    />
  </n-space>
</template>

<style scoped></style>

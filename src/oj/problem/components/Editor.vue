<script lang="ts" setup>
import { SOURCES } from "utils/constants"
import { code } from "oj/composables/code"
import { isDesktop } from "~/shared/composables/breakpoints"
import { problem } from "oj/composables/problem"
import storage from "~/utils/storage"

const Form = defineAsyncComponent(() => import("./Form.vue"))
const CodeEditor = defineAsyncComponent(() => import("~/shared/components/CodeEditor.vue"))

const route = useRoute()
const contestID = !!route.params.contestID ? route.params.contestID : null

const storageKey = computed(
  () =>
    `problem_${problem.value!._id}_contest_${contestID}_lang_${code.language}`,
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
  isDesktop.value ? "calc(100vh - 133px)" : "calc(100vh - 172px)",
)

function changeCode(v: string) {
  storage.set(storageKey.value, v)
}

function changeLanguage(v: string) {
  if (
    storage.get(storageKey.value) &&
    storageKey.value.split("_").pop() === v
  ) {
    code.value = storage.get(storageKey.value)
  } else {
    code.value =
      problem.value!.template[code.language] || SOURCES[code.language]
  }
}
</script>

<template>
  <n-space vertical>
    <Form @change-language="changeLanguage" />
    <CodeEditor
      v-model="code.value"
      @update:model-value="changeCode"
      :language="code.language"
      :height="editorHeight"
    />
  </n-space>
</template>

<style scoped></style>

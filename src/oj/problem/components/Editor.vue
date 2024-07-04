<script lang="ts" setup>
import { code } from "oj/composables/code"
import { problem } from "oj/composables/problem"
import { SOURCES } from "utils/constants"
import CodeEditor from "~/shared/components/CodeEditor.vue"
import { isDesktop } from "~/shared/composables/breakpoints"
import storage from "~/utils/storage"
import Form from "./Form.vue"

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
  <n-flex vertical>
    <Form :storage-key="storageKey" @change-language="changeLanguage" />
    <CodeEditor
      v-model:value="code.value"
      @update:model-value="changeCode"
      :language="code.language"
      :height="editorHeight"
    />
  </n-flex>
</template>

<style scoped></style>

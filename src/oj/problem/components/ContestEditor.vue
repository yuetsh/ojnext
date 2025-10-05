<script lang="ts" setup>
import { code } from "oj/composables/code"
import { problem } from "oj/composables/problem"
import { SOURCES } from "utils/constants"
import CodeEditor from "~/shared/components/CodeEditor.vue"
import { isDesktop } from "~/shared/composables/breakpoints"
import storage from "~/utils/storage"
import { LANGUAGE } from "~/utils/types"
import Form from "./Form.vue"

const route = useRoute()

const contestID = route.params.contestID || null
const storageKey = computed(
  () =>
    `problem_${problem.value!._id}_contest_${contestID}_lang_${code.language}`,
)

const editorHeight = computed(() =>
  isDesktop.value ? "calc(100vh - 133px)" : "calc(100vh - 172px)",
)

onMounted(() => {
  const savedCode = storage.get(storageKey.value)
  code.value =
    savedCode ||
    problem.value!.template[code.language] ||
    SOURCES[code.language]
})

const changeCode = (v: string) => {
  storage.set(storageKey.value, v)
}

const changeLanguage = (v: LANGUAGE) => {
  const savedCode = storage.get(storageKey.value)
  code.value =
    savedCode && storageKey.value.split("_").pop() === v
      ? savedCode
      : problem.value!.template[code.language] || SOURCES[code.language]
}
</script>

<template>
  <n-flex vertical>
    <Form :storage-key="storageKey" @change-language="changeLanguage" />
    <CodeEditor
      v-model:value="code.value"
      :language="code.language"
      :height="editorHeight"
      @update:model-value="changeCode"
    />
  </n-flex>
</template>

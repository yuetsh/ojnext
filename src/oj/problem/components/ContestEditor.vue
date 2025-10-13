<script lang="ts" setup>
import { storeToRefs } from "pinia"
import { useCodeStore } from "oj/store/code"
import { useProblemStore } from "oj/store/problem"
import { SOURCES } from "utils/constants"
import CodeEditor from "shared/components/CodeEditor.vue"
import { useBreakpoints } from "shared/composables/breakpoints"
import { provideSyncStatus } from "oj/composables/syncStatus"
import storage from "utils/storage"
import { LANGUAGE } from "utils/types"
import Form from "./Form.vue"

const route = useRoute()

const codeStore = useCodeStore()
const problemStore = useProblemStore()
const { problem } = storeToRefs(problemStore)

const { isDesktop } = useBreakpoints()

// 提供空的同步状态，避免 Form 组件注入错误
// 在竞赛模式下，同步功能会被 showSyncFeature 自动禁用
provideSyncStatus()

const contestID = route.params.contestID || null
const storageKey = computed(
  () =>
    `problem_${problem.value!._id}_contest_${contestID}_lang_${codeStore.code.language}`,
)

const editorHeight = computed(() =>
  isDesktop.value ? "calc(100vh - 133px)" : "calc(100vh - 172px)",
)

onMounted(() => {
  const savedCode = storage.get(storageKey.value)
  codeStore.setCode(
    savedCode ||
      problem.value!.template[codeStore.code.language] ||
      SOURCES[codeStore.code.language],
  )
})

const changeCode = (v: string) => {
  storage.set(storageKey.value, v)
}

const changeLanguage = (v: LANGUAGE) => {
  const savedCode = storage.get(storageKey.value)
  codeStore.setCode(
    savedCode && storageKey.value.split("_").pop() === v
      ? savedCode
      : problem.value!.template[codeStore.code.language] ||
          SOURCES[codeStore.code.language],
  )
}
</script>

<template>
  <n-flex vertical>
    <Form :storage-key="storageKey" @change-language="changeLanguage" />
    <CodeEditor
      v-model:value="codeStore.code.value"
      :language="codeStore.code.language"
      :height="editorHeight"
      @update:model-value="changeCode"
    />
  </n-flex>
</template>

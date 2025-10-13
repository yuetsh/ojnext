<script lang="ts" setup>
import { storeToRefs } from "pinia"
import { useCodeStore } from "oj/store/code"
import { useProblemStore } from "oj/store/problem"
import { provideSyncStatus } from "oj/composables/syncStatus"
import { SOURCES } from "utils/constants"
import SyncCodeEditor from "shared/components/SyncCodeEditor.vue"
import { useBreakpoints } from "shared/composables/breakpoints"
import storage from "utils/storage"
import { LANGUAGE } from "utils/types"
import Form from "./Form.vue"

const FlowchartEditor = defineAsyncComponent(
  () => import("shared/components/FlowchartEditor/index.vue"),
)

const route = useRoute()
const formRef = useTemplateRef<InstanceType<typeof Form>>("formRef")
const flowchartEditorRef = useTemplateRef("flowchartEditorRef")

const codeStore = useCodeStore()
const problemStore = useProblemStore()
const { problem } = storeToRefs(problemStore)

const { isDesktop } = useBreakpoints()

const sync = ref(false)
// 提供同步状态给子组件使用
const syncStatus = provideSyncStatus()

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

const toggleSync = (value: boolean) => {
  sync.value = value
  if (!value) {
    syncStatus.reset()
  }
}

const handleSyncClosed = () => {
  sync.value = false
  syncStatus.reset()
  formRef.value?.resetSyncStatus()
}

const handleSyncStatusChange = (status: {
  otherUser?: { name: string; isSuperAdmin: boolean }
}) => {
  syncStatus.setOtherUser(status.otherUser)
}

// 提供FlowchartEditor的ref给子组件
provide("flowchartEditorRef", flowchartEditorRef)
</script>

<template>
  <n-flex vertical>
    <Form
      ref="formRef"
      :storage-key="storageKey"
      :is-connected="sync"
      @change-language="changeLanguage"
      @toggle-sync="toggleSync"
    />
    <FlowchartEditor
      v-if="codeStore.code.language === 'Flowchart'"
      ref="flowchartEditorRef"
    />
    <SyncCodeEditor
      v-else
      v-model:value="codeStore.code.value"
      :sync="sync"
      :problem="problem!._id"
      :language="codeStore.code.language"
      :height="editorHeight"
      @update:model-value="changeCode"
      @sync-closed="handleSyncClosed"
      @sync-status-change="handleSyncStatusChange"
    />
  </n-flex>
</template>

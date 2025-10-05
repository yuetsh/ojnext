<script lang="ts" setup>
import { code } from "oj/composables/code"
import { problem } from "oj/composables/problem"
import { SOURCES } from "utils/constants"
import SyncCodeEditor from "~/shared/components/SyncCodeEditor.vue"
import { isDesktop } from "~/shared/composables/breakpoints"
import storage from "~/utils/storage"
import { LANGUAGE } from "~/utils/types"
import Form from "./Form.vue"

const route = useRoute()
const formRef = useTemplateRef<InstanceType<typeof Form>>("formRef")

const sync = ref(false)
const otherUserInfo = ref<{ name: string; isSuperAdmin: boolean }>()
const hadConnection = ref(false)

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

const toggleSync = (value: boolean) => {
  sync.value = value
  if (!value) {
    hadConnection.value = false
  }
}

const handleSyncClosed = () => {
  sync.value = false
  otherUserInfo.value = undefined
  hadConnection.value = false
  formRef.value?.resetSyncStatus()
}

const handleSyncStatusChange = (status: {
  otherUser?: { name: string; isSuperAdmin: boolean }
}) => {
  otherUserInfo.value = status.otherUser
  if (status.otherUser) {
    hadConnection.value = true
  }
}
</script>

<template>
  <n-flex vertical>
    <Form
      ref="formRef"
      :storage-key="storageKey"
      :other-user-info="otherUserInfo"
      :is-connected="sync"
      :had-connection="hadConnection"
      @change-language="changeLanguage"
      @toggle-sync="toggleSync"
    />
    <SyncCodeEditor
      v-model:value="code.value"
      :sync="sync"
      :problem="problem!._id"
      :language="code.language"
      :height="editorHeight"
      @update:model-value="changeCode"
      @sync-closed="handleSyncClosed"
      @sync-status-change="handleSyncStatusChange"
    />
  </n-flex>
</template>

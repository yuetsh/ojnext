<script lang="ts" setup>
import { cpp } from "@codemirror/lang-cpp"
import { python } from "@codemirror/lang-python"
import { bracketMatching } from "@codemirror/language"
import { EditorView } from "@codemirror/view"
import { Codemirror } from "vue-codemirror"
import {
  autocompletion,
  closeBrackets,
  completeAnyWord,
} from "@codemirror/autocomplete"
import type { Extension } from "@codemirror/state"
import type { LANGUAGE } from "utils/types"
import { oneDark } from "../themes/oneDark"
import { smoothy } from "../themes/smoothy"
import { styleTheme } from "shared/extensions/baseTheme"
import { useCodeSync, SYNC_ERROR_CODES } from "../composables/sync"
import { useBreakpoints } from "../composables/breakpoints"
import { enhanceCompletion } from "shared/extensions/autocompletion"

const isDark = useDark()

interface EditorReadyPayload {
  view: EditorView
  state: any
  container: HTMLElement
}

interface Props {
  sync: boolean
  problem: string
  language?: LANGUAGE
  fontSize?: number
  height?: string
  readonly?: boolean
  placeholder?: string
}

const {
  sync,
  problem,
  language = "Python3",
  fontSize = 20,
  height = "100%",
  readonly = false,
  placeholder = "",
} = defineProps<Props>()
const code = defineModel<string>("value")

const emit = defineEmits<{
  syncClosed: []
  syncStatusChange: [
    status: { otherUser?: { name: string; isSuperAdmin: boolean } },
  ]
}>()

const { isDesktop } = useBreakpoints()

const langExtension = computed((): Extension => {
  return ["Python2", "Python3"].includes(language) ? python() : cpp()
})

const extensions = computed(() => [
  styleTheme,
  langExtension.value,
  bracketMatching(),
  closeBrackets(),
  isDark.value ? oneDark : smoothy,
  autocompletion({
    override: [enhanceCompletion(language), completeAnyWord],
  }),
  getInitialExtension(),
])

const { startSync, stopSync, getInitialExtension } = useCodeSync()
const editorView = ref<EditorView | null>(null)
let cleanupSync: (() => void) | null = null

const cleanupSyncResources = () => {
  if (cleanupSync) {
    cleanupSync()
    cleanupSync = null
  }
  stopSync()
}

const initSync = async () => {
  if (!editorView.value || !problem || !isDesktop.value) return

  cleanupSyncResources()

  cleanupSync = await startSync({
    problemId: problem,
    editorView: editorView.value as EditorView,
    onStatusChange: (status) => {
      // 处理需要断开同步的情况
      if (
        (status.errorCode === SYNC_ERROR_CODES.SUPER_ADMIN_LEFT ||
          status.errorCode === SYNC_ERROR_CODES.MISSING_SUPER_ADMIN) &&
        !status.connected
      ) {
        emit("syncClosed")
      }
      emit("syncStatusChange", { otherUser: status.otherUser })
    },
  })
}

const handleEditorReady = (payload: EditorReadyPayload) => {
  editorView.value = payload.view as EditorView
  if (sync) {
    initSync()
  }
}

watch(
  () => sync,
  (shouldSync) => {
    if (shouldSync) {
      initSync()
    } else {
      cleanupSyncResources()
    }
  },
)

watch(
  () => problem,
  (newProblem, oldProblem) => {
    if (newProblem !== oldProblem && sync) {
      initSync()
    }
  },
)

onUnmounted(cleanupSyncResources)
</script>

<template>
  <Codemirror
    v-model="code"
    indentWithTab
    :extensions="extensions"
    :disabled="readonly"
    :tab-size="4"
    :placeholder="placeholder"
    :style="{ height, fontSize: `${fontSize}px` }"
    @ready="handleEditorReady"
  />
</template>

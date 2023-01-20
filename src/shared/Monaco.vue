<script setup lang="ts">
import type * as Monaco from "monaco-editor"
import { LANGUAGE_VALUE } from "utils/constants"
import { LANGUAGE } from "utils/types"
import { isMobile } from "~/shared/composables/breakpoints"
import { isDark } from "./composables/dark"
import { monaco } from "./composables/monaco"

interface Props {
  value: string
  language?: LANGUAGE
  height?: string
  fontSize?: number
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: "C",
  height: "calc(100vh - 92px)",
  fontSize: 20,
  class: "",
})

const emit = defineEmits<{
  (e: "change", value: string): void
}>()

const monacoEditorRef = ref()
let editor: Monaco.editor.IStandaloneCodeEditor
let model: Monaco.editor.ITextModel

onMounted(() => {
  if (!monaco.value) return
  model = monaco.value!.editor.createModel(
    props.value,
    LANGUAGE_VALUE[props.language]
  )

  editor = monaco.value!.editor.create(monacoEditorRef.value, {
    model,
    theme: isDark.value ? "dark" : "light", // 官方自带三种主题vs, hc-black, or vs-dark
    minimap: {
      enabled: false,
    },
    lineNumbersMinChars: 3,
    automaticLayout: true, // 自适应布局
    tabSize: 4,
    fontSize: isMobile.value ? 20 : 24, // 字体大小
    scrollBeyondLastLine: false,
    lineDecorationsWidth: 0,
    scrollBeyondLastColumn: 0,
    glyphMargin: false,
    scrollbar: {
      useShadows: false,
      vertical: "hidden",
      horizontal: "hidden",
    },
    overviewRulerLanes: 0,
  })

  model.onDidChangeContent(() => {
    const value = model.getValue().toString()
    emit("change", value)
  })

  editor.onKeyDown((e) => {
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyS") {
      e.preventDefault()
    }
    if ((e.ctrlKey || e.metaKey) && e.code === "KeyR") {
      e.preventDefault()
    }
  })

  watchEffect(() => {
    if (!monaco.value) return
    monaco.value.editor.setModelLanguage(model, LANGUAGE_VALUE[props.language])
  })

  watchEffect(() => {
    if (props.value !== model.getValue()) {
      model.setValue(props.value)
    }
  })

  watchEffect(() => {
    if (!monaco.value) return
    monaco.value.editor.setTheme(isDark.value ? "dark" : "light")
  })
})
onUnmounted(() => {
  editor && editor.dispose()
})
</script>
<template>
  <div
    v-if="monaco"
    ref="monacoEditorRef"
    :class="props.class"
    :style="{ height: props.height }"
  ></div>
</template>
<style scoped></style>
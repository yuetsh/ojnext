<script setup lang="ts">
import type * as Monaco from "monaco-editor"
import { LANGUAGE_VALUE } from "utils/constants"
import { LANGUAGE } from "utils/types"
import { isMobile } from "utils/breakpoints"

interface Props {
  value: string
  language?: LANGUAGE
  height?: string
  fontSize?: number
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: "C",
  height: "calc(100vh - 100px)",
  fontSize: 20,
  class: "",
})

const emit = defineEmits<{
  (e: "change", value: string): void
}>()

const monacoEditorRef = ref()
let editor: Monaco.editor.IStandaloneCodeEditor

onMounted(function () {
  const model = window.monaco.editor.createModel(
    props.value,
    LANGUAGE_VALUE[props.language],
    window.monaco.Uri.parse(`file:///root/${Date.now()}.${ext()}`)
  )

  editor = window.monaco.editor.create(monacoEditorRef.value, {
    model,
    theme: "dark", // 官方自带三种主题vs, hc-black, or vs-dark
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
    window.monaco.editor.setModelLanguage(model, LANGUAGE_VALUE[props.language])
  })

  watchEffect(() => {
    if (props.value !== model.getValue()) {
      model.setValue(props.value)
    }
  })
})

onUnmounted(() => {
  editor && editor.dispose()
})

function ext() {
  switch (props.language) {
    case "C":
      return "c"
    case "C++":
      return "cpp"
    case "Java":
      return "java"
    case "JavaScript":
      return "js"
    case "Python2":
      return "py"
    case "Python3":
      return "py"
    case "Golang":
      return "go"
  }
}
</script>
<template>
  <div
    ref="monacoEditorRef"
    :class="props.class"
    :style="{ height: props.height }"
  ></div>
</template>
<style scoped></style>

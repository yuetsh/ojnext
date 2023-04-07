<script lang="ts" setup>
import { Codemirror } from "vue-codemirror"
import { cpp } from "@codemirror/lang-cpp"
import { python } from "@codemirror/lang-python"
import { java } from "@codemirror/lang-java"
import { javascript } from "@codemirror/lang-javascript"
import { LANGUAGE } from "~/utils/types"
import { EditorView } from "@codemirror/view"

const styleTheme = EditorView.baseTheme({
  "&.cm-editor.cm-focused": {
    outline: "none",
  },
})

interface Props {
  value: string
  language?: LANGUAGE
  fontSize?: number
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: "C",
  fontSize: 20,
  height: "100%",
})

const code = ref(props.value)
const emit = defineEmits(["update:value"])

const lang = computed(() => {
  if (props.language === "C" || props.language === "C++") return cpp()
  if (props.language === "Java") return java()
  if (props.language === "JavaScript") return javascript()
  return python()
})

function onChange(v: string) {
  emit("update:value", v)
}
</script>
<template>
  <Codemirror
    v-model="code"
    :extensions="[styleTheme, lang]"
    indentWithTab
    :tabSize="4"
    @change="onChange"
    :style="{
      height: props.height,
      fontSize: props.fontSize + 'px',
    }"
  />
</template>

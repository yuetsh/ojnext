<script lang="ts" setup>
import { Codemirror } from "vue-codemirror"
import { cpp } from "@codemirror/lang-cpp"
import { python } from "@codemirror/lang-python"
import { EditorView } from "@codemirror/view"
import { oneDark } from "./themes/oneDark"
import { smoothy } from "./themes/smoothy"
import { LANGUAGE } from "~/utils/types"
import { isDark } from "./composables/dark"

const styleTheme = EditorView.baseTheme({
  "& .cm-scroller": {
    "font-family": "Consolas",
  },
  "&.cm-editor.cm-focused": {
    outline: "none",
  },
})

interface Props {
  modelValue: string
  language?: LANGUAGE
  fontSize?: number
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: "C",
  fontSize: 20,
  height: "100%",
})

const code = ref(props.modelValue)
watch(
  () => props.modelValue,
  (v) => {
    code.value = v
  }
)
const emit = defineEmits(["update:modelValue"])

const lang = computed(() => {
  if (props.language === "Python3" || props.language === "Python2") {
    return python()
  }
  return cpp()
})

function onChange(v: string) {
  emit("update:modelValue", v)
}
</script>
<template>
  <Codemirror
    v-model="code"
    :extensions="[styleTheme, lang, isDark ? oneDark : smoothy]"
    indentWithTab
    :tabSize="4"
    @change="onChange"
    :style="{
      height: props.height,
      fontSize: props.fontSize + 'px',
    }"
  />
</template>

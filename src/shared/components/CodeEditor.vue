<script lang="ts" setup>
import { cpp } from "@codemirror/lang-cpp"
import { python } from "@codemirror/lang-python"
import { EditorView } from "@codemirror/view"
import { Codemirror } from "vue-codemirror"
import { LANGUAGE } from "~/utils/types"
import { oneDark } from "../themes/oneDark"
import { smoothy } from "../themes/smoothy"

const styleTheme = EditorView.baseTheme({
  "& .cm-scroller": {
    "font-family": "Monaco",
  },
  "&.cm-editor.cm-focused": {
    outline: "none",
  },
  "&.cm-editor .cm-tooltip.cm-tooltip-autocomplete ul": {
    "font-family": "Monaco",
  },
})

interface Props {
  language?: LANGUAGE
  fontSize?: number
  height?: string
  readonly?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: "Python3",
  fontSize: 20,
  height: "100%",
  readonly: false,
  placeholder: "",
})

const code = defineModel<string>("value")

const isDark = useDark()

const lang = computed(() => {
  if (["Python2", "Python3"].includes(props.language)) {
    return python()
  }
  return cpp()
})
</script>
<template>
  <Codemirror
    v-model="code"
    indentWithTab
    :extensions="[styleTheme, lang, isDark ? oneDark : smoothy]"
    :disabled="props.readonly"
    :tabSize="4"
    :placeholder="props.placeholder"
    :style="{ height: props.height, fontSize: props.fontSize + 'px' }"
  />
</template>

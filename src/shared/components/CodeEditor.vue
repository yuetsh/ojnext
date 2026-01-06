<script lang="ts" setup>
import { cpp } from "@codemirror/lang-cpp"
import { python } from "@codemirror/lang-python"
import { EditorView } from "@codemirror/view"
import { Codemirror } from "vue-codemirror"
import { autocompletion } from "@codemirror/autocomplete"
import { LANGUAGE } from "utils/types"
import { oneDark } from "../themes/oneDark"
import { smoothy } from "../themes/smoothy"
import { enhanceCompletion } from "shared/extensions/autocompletion"


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

const { readonly, placeholder, height, fontSize } = toRefs(props)
const code = defineModel<string>("value")

const isDark = useDark()

const styleTheme = EditorView.baseTheme({
  "& .cm-scroller": { "font-family": "Monaco" },
  "&.cm-editor.cm-focused": { outline: "none" },
  "&.cm-editor .cm-tooltip.cm-tooltip-autocomplete ul": {
    "font-family": "Monaco",
  },
})

const langExtension = computed(() => {
  return ["Python2", "Python3"].includes(props.language) ? python() : cpp()
})

const extensions = computed(() => [
  styleTheme,
  langExtension.value,
  autocompletion({
    override: [enhanceCompletion(props.language)],
  }),
  isDark.value ? oneDark : smoothy,
])
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
  />
</template>

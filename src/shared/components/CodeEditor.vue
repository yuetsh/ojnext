<script lang="ts" setup>
import { Codemirror } from "vue-codemirror"
import { cpp } from "@codemirror/lang-cpp"
import { python } from "@codemirror/lang-python"
import { EditorView } from "@codemirror/view"
import { oneDark } from "../themes/oneDark"
import { smoothy } from "../themes/smoothy"
import { LANGUAGE } from "~/utils/types"

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
  modelValue: string
  language?: LANGUAGE
  fontSize?: number
  height?: string
  readonly?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  language: "C",
  fontSize: 20,
  height: "100%",
  readonly: false,
  placeholder: "",
})

const code = ref(props.modelValue)

const isDark = useDark()

watch(
  () => props.modelValue,
  (v) => {
    code.value = v
  },
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
    indentWithTab
    :extensions="[styleTheme, lang, isDark ? oneDark : smoothy]"
    :disabled="props.readonly"
    :tabSize="4"
    :placeholder="props.placeholder"
    :style="{ height: props.height, fontSize: props.fontSize + 'px' }"
    @change="onChange"
  />
</template>

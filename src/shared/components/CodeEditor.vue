<script lang="ts" setup>
import { cpp } from "@codemirror/lang-cpp"
import { python } from "@codemirror/lang-python"
import { bracketMatching } from "@codemirror/language"
import { Codemirror } from "vue-codemirror"
import {
  autocompletion,
  closeBrackets,
  completeAnyWord,
} from "@codemirror/autocomplete"
import type { LANGUAGE } from "utils/types"
import { oneDark } from "../themes/oneDark"
import { smoothy } from "../themes/smoothy"
import { styleTheme } from "shared/extensions/baseTheme"
import { enhanceCompletion } from "shared/extensions/autocompletion"

interface Props {
  language?: LANGUAGE
  fontSize?: number
  height?: string
  readonly?: boolean
  placeholder?: string
}

const {
  language = "Python3",
  fontSize = 20,
  height = "100%",
  readonly = false,
  placeholder = "",
} = defineProps<Props>()
const code = defineModel<string>("value")

const isDark = useDark()

const langExtension = computed(() => {
  return ["Python2", "Python3"].includes(language) ? python() : cpp()
})

const extensions = computed(() => [
  styleTheme,
  langExtension.value,
  bracketMatching(),
  closeBrackets(),
  autocompletion({
    override: [enhanceCompletion(language), completeAnyWord],
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

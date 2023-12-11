<script setup lang="ts">
import "normalize.css"
import { zhCN, dateZhCN, darkTheme } from "naive-ui"
import { isDark } from "./shared/composables/dark"
import hljs from "highlight.js/lib/core"
import c from "highlight.js/lib/languages/c"
import python from "highlight.js/lib/languages/python"
import "./index.css"

const theme = computed(() => (isDark.value ? darkTheme : null))

hljs.registerLanguage("c", c)
hljs.registerLanguage("python", python)
</script>

<template>
  <n-config-provider
    inline-theme-disabled
    :theme="theme"
    :locale="zhCN"
    :date-locale="dateZhCN"
    :hljs="hljs"
  >
    <n-message-provider>
      <router-view></router-view>
    </n-message-provider>
  </n-config-provider>
</template>

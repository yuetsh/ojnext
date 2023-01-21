<script setup lang="ts">
import { zhCN, dateZhCN, darkTheme } from "naive-ui"
import { isDark } from "./shared/composables/dark"
import hljs from "highlight.js/lib/core"
import c from "highlight.js/lib/languages/c"
import cpp from "highlight.js/lib/languages/c"
import java from "highlight.js/lib/languages/java"
import python from "highlight.js/lib/languages/python"
import javascript from "highlight.js/lib/languages/javascript"
import go from "highlight.js/lib/languages/go"

const theme = computed(() => (isDark.value ? darkTheme : null))

hljs.registerLanguage("c", c)
hljs.registerLanguage("cpp", cpp)
hljs.registerLanguage("java", java)
hljs.registerLanguage("python", python)
hljs.registerLanguage("javascript", javascript)
hljs.registerLanguage("go", go)
</script>

<template>
  <n-config-provider
    inline-theme-disabled
    :theme="theme"
    :locale="zhCN"
    :date-locale="dateZhCN"
    :hljs="hljs"
  >
    <n-notification-provider>
      <router-view></router-view>
    </n-notification-provider>
  </n-config-provider>
</template>

<style scoped></style>

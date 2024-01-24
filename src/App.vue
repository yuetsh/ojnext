<script setup lang="ts">
import "normalize.css"
import { zhCN, dateZhCN, darkTheme } from "naive-ui"
import hljs from "highlight.js/lib/core"
import c from "highlight.js/lib/languages/c"
import python from "highlight.js/lib/languages/python"
import "./index.css"

hljs.registerLanguage("c", c)
hljs.registerLanguage("python", python)

const isDark = useDark()
</script>

<template>
  <n-config-provider
    :theme="isDark ? darkTheme : null"
    :locale="zhCN"
    :date-locale="dateZhCN"
    :hljs="hljs"
  >
    <n-message-provider>
      <router-view></router-view>
    </n-message-provider>
  </n-config-provider>
</template>

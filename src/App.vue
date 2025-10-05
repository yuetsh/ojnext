<script setup lang="ts">
import { darkTheme, dateZhCN, zhCN } from "naive-ui"
import "normalize.css"
import "./index.css"

const isDark = useDark()

// 延迟加载 highlight.js，避免阻塞首屏
let hljsInstance: any = null
const loadHighlightJS = async () => {
  if (hljsInstance) return hljsInstance

  const hljs = (await import("highlight.js/lib/core")).default
  const c = (await import("highlight.js/lib/languages/c")).default
  const cpp = (await import("highlight.js/lib/languages/cpp")).default
  const python = (await import("highlight.js/lib/languages/python")).default

  hljs.registerLanguage("c", c)
  hljs.registerLanguage("python", python)
  hljs.registerLanguage("cpp", cpp)

  hljsInstance = hljs
  return hljs
}

// 在空闲时预加载
onMounted(() => {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => loadHighlightJS())
  } else {
    setTimeout(() => loadHighlightJS(), 1000)
  }
})

provide(
  "hljs",
  computed(() => hljsInstance),
)
</script>

<template>
  <n-config-provider
    :theme="isDark ? darkTheme : null"
    :locale="zhCN"
    :date-locale="dateZhCN"
    :hljs="hljsInstance"
  >
    <n-message-provider>
      <router-view></router-view>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { darkTheme, dateZhCN, zhCN } from "naive-ui"
import "normalize.css"
import "./index.css"
import { useConfigStore } from "shared/store/config"
import { useConfigUpdate } from "shared/composables/configUpdate"
import { useMaxKB } from "shared/composables/maxkb"
import { useUserStore } from "shared/store/user"

const isDark = useDark()
const configStore = useConfigStore()
const userStore = useUserStore()

// 初始化配置和实时更新
onMounted(() => {
  configStore.getConfig()
  userStore.getMyProfile()
})

// 使用配置更新和 MaxKB 功能
useConfigUpdate()
useMaxKB()

// 延迟加载 highlight.js，避免阻塞首屏
const hljsInstance = ref<any>(null)
const loadHighlightJS = async () => {
  if (hljsInstance.value) return hljsInstance.value

  const hljs = (await import("highlight.js/lib/core")).default
  const c = (await import("highlight.js/lib/languages/c")).default
  const cpp = (await import("highlight.js/lib/languages/cpp")).default
  const python = (await import("highlight.js/lib/languages/python")).default

  hljs.registerLanguage("c", c)
  hljs.registerLanguage("python", python)
  hljs.registerLanguage("cpp", cpp)

  hljsInstance.value = hljs
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

provide("hljs", hljsInstance)
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

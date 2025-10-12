import { useConfigStore } from "shared/store/config"
import { useUserStore } from "shared/store/user"
import {
  useConfigWebSocket,
  type ConfigUpdate,
} from "shared/composables/websocket"

export function useMaxKB() {
  const configStore = useConfigStore()
  const userStore = useUserStore()
  const isLoaded = ref(false)

  // 处理 WebSocket 配置更新 - 只处理 MaxKB 相关
  const handleConfigUpdate = (data: ConfigUpdate) => {
    if (data.key === "enable_maxkb") {
      if (data.value) {
        loadMaxKBScript()
      } else {
        removeMaxKBScript()
      }
    }
  }

  // 初始化 WebSocket
  const { connect, disconnect } = useConfigWebSocket(handleConfigUpdate)

  // 监听登录状态变化
  watch(
    () => userStore.isAuthed,
    (isAuthed) => {
      if (isAuthed) {
        connect()
      } else {
        disconnect()
      }
    },
    { immediate: true }
  )

  const loadMaxKBScript = () => {
    const { enable_maxkb } = configStore.config

    if (!enable_maxkb) {
      return
    }

    const existingScript = document.querySelector(
      `script[src="${import.meta.env.PUBLIC_MAXKB_URL}"]`,
    )
    if (existingScript) {
      isLoaded.value = true
      return
    }

    // 创建并插入脚本标签
    const script = document.createElement("script")
    script.src = import.meta.env.PUBLIC_MAXKB_URL
    script.async = true
    script.defer = true

    script.onload = () => {
      isLoaded.value = true
    }

    script.onerror = () => {
      console.error("Failed to load MaxKB script")
    }

    document.head.appendChild(script)
  }

  const removeMaxKBScript = () => {
    // 把 script 也删除
    const script = document.querySelector(
      `script[src="${import.meta.env.PUBLIC_MAXKB_URL}"]`,
    )
    if (script) {
      script.remove()
    }
    // 等待DOM加载完成后删除所有id以"maxkb-"开头的元素
    const removeMaxKBElements = () => {
      // 查找所有id以"maxkb-"开头的元素
      const elements = document.querySelectorAll('[id^="maxkb-"]')

      elements.forEach((element) => {
        element.remove()
      })
    }

    // 如果DOM已经加载完成，直接执行删除
    if (document.readyState === "complete") {
      removeMaxKBElements()
    } else {
      // 等待DOM加载完成
      window.addEventListener("load", removeMaxKBElements, { once: true })
    }

    // 移除MaxKB脚本标签
    const existingScript = document.querySelector(
      `script[src="${import.meta.env.PUBLIC_MAXKB_URL}"]`,
    )
    if (existingScript) {
      existingScript.remove()
    }

    // 重置加载状态
    isLoaded.value = false
  }

  // 连接 WebSocket
  onMounted(() => {
    connect()
  })

  watch(
    () => configStore.config.enable_maxkb,
    (enabled) => {
      if (enabled) {
        loadMaxKBScript()
      } else {
        removeMaxKBScript()
      }
    },
    { immediate: true },
  )

  return {
    loadMaxKBScript,
    removeMaxKBScript,
    isLoaded: readonly(isLoaded),
  }
}

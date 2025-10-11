import { useConfigStore } from "shared/store/config"
import { useConfigWebSocket, type ConfigUpdate } from "shared/composables/websocket"

export function useMaxKB() {
  const configStore = useConfigStore()
  const isLoaded = ref(false)
  
  // 处理 WebSocket 配置更新 - 只处理 MaxKB 相关
  const handleConfigUpdate = (data: ConfigUpdate) => {
    console.log("MaxKB 收到配置更新:", data)
    if (data.key === 'enable_maxkb') {
      if (data.value) {
        loadMaxKBScript()
      } else {
        removeMaxKBScript()
      }
    }
  }
  
  // 初始化 WebSocket
  const { connect } = useConfigWebSocket(handleConfigUpdate)

  const loadMaxKBScript = () => {
    const { enable_maxkb } = configStore.config

    if (!enable_maxkb) {
      return
    }

    const existingScript = document.querySelector(`script[src="${import.meta.env.PUBLIC_MAXKB_URL}"]`)
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
      console.log("MaxKB script loaded successfully")
    }
    
    script.onerror = () => {
      console.error("Failed to load MaxKB script")
    }

    document.head.appendChild(script)
  }

  const removeMaxKBScript = () => {
    isLoaded.value = false
    const maxkbChatButton = document.getElementById("maxkb-chat-button")
    const maxkbChatContainer = document.getElementById("maxkb-chat-container")
    if (maxkbChatButton) {
      maxkbChatButton.remove()
    }
    if (maxkbChatContainer) {
      maxkbChatContainer.remove()
    }
  }

  // 连接 WebSocket
  onMounted(() => {
    connect()
  })

  watch(
    () => configStore.config.enable_maxkb,
    (newValue) => {
      if (newValue) {
        loadMaxKBScript()
      } else {
        console.log("removeMaxKBScript")
        removeMaxKBScript()
      }
    },
    { immediate: true }
  )

  return {
    loadMaxKBScript,
    removeMaxKBScript,
    isLoaded: readonly(isLoaded)
  }
}

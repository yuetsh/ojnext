import { useConfigStore } from "shared/store/config"
import { useUserStore } from "shared/store/user"
import {
  useConfigWebSocket,
  type ConfigUpdate,
} from "shared/composables/websocket"

export function useConfigUpdate() {
  const configStore = useConfigStore()
  const userStore = useUserStore()

  // 处理 WebSocket 配置更新
  const handleConfigUpdate = (data: ConfigUpdate) => {
    // 更新全局配置 - 使用响应式方式
    if (data.key in configStore.config) {
      // 直接修改 ref 的值来触发响应式更新
      ;(configStore.config as any)[data.key] = data.value
    }
  }

  // 初始化 WebSocket - handler 会在 onMounted 时自动添加
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
    { immediate: true },
  )

  return {
    connect,
    disconnect,
  }
}

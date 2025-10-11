import { useConfigStore } from "shared/store/config"
import { useConfigWebSocket, type ConfigUpdate } from "shared/composables/websocket"

export function useConfigUpdate() {
  const configStore = useConfigStore()
  
  // 处理 WebSocket 配置更新
  const handleConfigUpdate = (data: ConfigUpdate) => {
    console.log("收到配置更新:", data)
    
    // 更新全局配置 - 使用响应式方式
    if (data.key in configStore.config) {
      // 直接修改 ref 的值来触发响应式更新
      (configStore.config as any)[data.key] = data.value
      console.log(`配置 ${data.key} 已更新为:`, data.value)
    }
  }
  
  // 初始化 WebSocket - handler 会在 onMounted 时自动添加
  const { connect, status } = useConfigWebSocket(handleConfigUpdate)
  
  // 连接 WebSocket
  onMounted(() => {
    console.log("配置更新 WebSocket 正在连接...")
    connect()
    
    // 测试连接 - 发送心跳包
    setTimeout(() => {
      if (status.value === "connected") {
        console.log("配置更新 WebSocket 连接成功，发送测试消息...")
        // 这里可以发送一个测试消息
      }
    }, 2000)
  })
  
  // 监听连接状态
  watch(status, (newStatus) => {
    console.log("配置更新 WebSocket 状态:", newStatus)
  })

  return {
    connect
  }
}

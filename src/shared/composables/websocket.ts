import { ref, onUnmounted, type Ref } from "vue"

/**
 * WebSocket 连接状态
 */
export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error"

/**
 * WebSocket 消息类型
 */
export interface WebSocketMessage {
  type: string
  [key: string]: any
}

/**
 * WebSocket 配置
 */
export interface WebSocketConfig {
  /** WebSocket 路径（如 '/ws/submission/'） */
  path: string
  /** 最大重连次数，默认 5 */
  maxReconnectAttempts?: number
  /** 重连延迟（毫秒），默认 1000 */
  reconnectDelay?: number
  /** 心跳间隔（毫秒），默认 30000（30秒） */
  heartbeatTime?: number
  /** 是否启用心跳，默认 true */
  enableHeartbeat?: boolean
  /** 是否启用自动重连，默认 true */
  enableAutoReconnect?: boolean
}

/**
 * WebSocket 消息处理器
 */
export type MessageHandler<T extends WebSocketMessage = WebSocketMessage> = (
  data: T,
) => void

/**
 * WebSocket 基础连接管理类
 * 提供连接、重连、心跳等通用功能
 */
export class BaseWebSocket<T extends WebSocketMessage = WebSocketMessage> {
  protected ws: WebSocket | null = null
  protected url: string
  protected handlers: Set<MessageHandler<T>> = new Set()
  protected reconnectAttempts = 0
  protected maxReconnectAttempts: number
  protected reconnectDelay: number
  protected heartbeatInterval: number | null = null
  protected heartbeatTime: number
  protected enableHeartbeat: boolean
  protected enableAutoReconnect: boolean
  protected disconnectTimer: number | null = null

  public status: Ref<ConnectionStatus> = ref<ConnectionStatus>("disconnected")

  constructor(config: WebSocketConfig) {
    this.url = `${import.meta.env.PUBLIC_WS_URL}/${config.path}/`

    this.maxReconnectAttempts = config.maxReconnectAttempts ?? 5
    this.reconnectDelay = config.reconnectDelay ?? 1000
    this.heartbeatTime = config.heartbeatTime ?? 30000
    this.enableHeartbeat = config.enableHeartbeat ?? true
    this.enableAutoReconnect = config.enableAutoReconnect ?? true
  }

  /**
   * 连接 WebSocket
   */
  connect() {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return
    }

    this.status.value = "connecting"

    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        this.status.value = "connected"
        this.reconnectAttempts = 0
        console.log(`[WebSocket] 连接成功: ${this.url}`)
        if (this.enableHeartbeat) {
          this.startHeartbeat()
        }
        this.onConnected()
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as T
          console.log(`[WebSocket] 收到消息:`, data)

          // 处理心跳响应
          if (data.type === "pong") {
            return
          }

          // 调用消息处理钩子
          this.onMessage(data)
        } catch (error) {
          console.error("[WebSocket] 解析消息失败:", error)
        }
      }

      this.ws.onerror = (error) => {
        console.error("[WebSocket] 连接错误:", error)
        this.status.value = "error"
        this.onError(error)
      }

      this.ws.onclose = (event) => {
        console.log(
          `[WebSocket] 连接关闭: code=${event.code}, reason=${event.reason}`,
        )
        this.status.value = "disconnected"
        this.stopHeartbeat()
        this.onDisconnected(event)

        // 自动重连
        if (
          this.enableAutoReconnect &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.reconnectAttempts++
          const delay = this.reconnectDelay * this.reconnectAttempts
          console.log(
            `[WebSocket] 将在 ${delay}ms 后重连 (尝试 ${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
          )
          setTimeout(() => this.connect(), delay)
        }
      }
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error)
      this.status.value = "error"
    }
  }

  /**
   * 断开连接
   */
  disconnect() {
    this.cancelScheduledDisconnect()
    this.stopHeartbeat()
    this.enableAutoReconnect = false // 停止自动重连
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.status.value = "disconnected"
  }

  /**
   * 安排延迟断开连接
   * @param delay 延迟时间（毫秒），默认 900000（15分钟）
   */
  scheduleDisconnect(delay: number = 15 * 60 * 1000) {
    // 取消之前的定时器
    this.cancelScheduledDisconnect()

    // 设置新的定时器
    this.disconnectTimer = window.setTimeout(() => {
      const minutes = Math.floor(delay / 60000)
      console.log(`WebSocket idle for ${minutes} minutes, disconnecting...`)
      this.disconnect()
      // 断开后需要重新允许自动重连
      this.enableAutoReconnect = true
    }, delay)
  }

  /**
   * 取消已安排的断开连接
   */
  cancelScheduledDisconnect() {
    if (this.disconnectTimer !== null) {
      clearTimeout(this.disconnectTimer)
      this.disconnectTimer = null
    }
  }

  /**
   * 发送消息
   */
  send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
      return true
    }
    return false
  }

  /**
   * 添加消息处理器
   */
  addHandler(handler: MessageHandler<T>) {
    this.handlers.add(handler)
  }

  /**
   * 移除消息处理器
   */
  removeHandler(handler: MessageHandler<T>) {
    this.handlers.delete(handler)
  }

  /**
   * 清除所有处理器
   */
  clearHandlers() {
    this.handlers.clear()
  }

  /**
   * 发送心跳包
   */
  protected sendHeartbeat() {
    this.send({ type: "ping", timestamp: Date.now() })
  }

  /**
   * 开始心跳
   */
  protected startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatInterval = window.setInterval(() => {
      this.sendHeartbeat()
    }, this.heartbeatTime)
  }

  /**
   * 停止心跳
   */
  protected stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * 连接成功钩子（子类可重写）
   */
  protected onConnected() {
    // 子类实现
  }

  /**
   * 断开连接钩子（子类可重写）
   */
  protected onDisconnected(event: CloseEvent) {
    // 子类实现
  }

  /**
   * 错误钩子（子类可重写）
   */
  protected onError(error: Event) {
    // 子类实现
  }

  /**
   * 消息处理钩子（子类可重写）
   */
  protected onMessage(data: T) {
    // 通知所有处理器
    this.handlers.forEach((handler) => {
      try {
        handler(data)
      } catch (error) {
        console.error("Error in message handler:", error)
      }
    })
  }
}

/**
 * 提交状态更新的数据类型
 */
export interface SubmissionUpdate extends WebSocketMessage {
  type: "submission_update"
  submission_id: string
  result: number
  status: "pending" | "judging" | "finished" | "error"
  time_cost?: number
  memory_cost?: number
  score?: number
  err_info?: string
}

/**
 * 提交 WebSocket 连接管理类
 */
class SubmissionWebSocket extends BaseWebSocket<SubmissionUpdate> {
  constructor() {
    super({
      path: "submission",
    })
  }

  /**
   * 订阅特定提交的更新
   */
  subscribe(submissionId: string) {
    console.log(`[WebSocket] 发送订阅请求: submission_id=${submissionId}`)
    const success = this.send({
      type: "subscribe",
      submission_id: submissionId,
    })
    if (!success) {
      console.error("[WebSocket] 订阅失败: 连接未就绪")
    }
  }
}

/**
 * 用于组件中使用 WebSocket 的 Composable
 * 每次调用创建新的 WebSocket 实例
 */
export function useSubmissionWebSocket(
  handler?: MessageHandler<SubmissionUpdate>,
) {
  const ws = new SubmissionWebSocket()

  // 如果提供了处理器，添加到实例中
  if (handler) {
    ws.addHandler(handler)
  }

  // 组件卸载时清理资源
  onUnmounted(() => {
    if (handler) {
      ws.removeHandler(handler)
    }
    ws.disconnect()
  })

  return {
    connect: () => ws.connect(),
    disconnect: () => ws.disconnect(),
    subscribe: (submissionId: string) => ws.subscribe(submissionId),
    scheduleDisconnect: (delay?: number) => ws.scheduleDisconnect(delay),
    cancelScheduledDisconnect: () => ws.cancelScheduledDisconnect(),
    status: ws.status,
    addHandler: (h: MessageHandler<SubmissionUpdate>) => ws.addHandler(h),
    removeHandler: (h: MessageHandler<SubmissionUpdate>) => ws.removeHandler(h),
  }
}

/**
 * 通用 WebSocket Composable 工厂函数
 * 用于创建自定义的 WebSocket composable
 *
 * @example
 * ```ts
 * // 创建通知 WebSocket
 * interface NotificationMessage extends WebSocketMessage {
 *   type: 'notification'
 *   title: string
 *   content: string
 * }
 *
 * class NotificationWebSocket extends BaseWebSocket<NotificationMessage> {
 *   constructor() {
 *     super({ path: 'notification' })
 *   }
 * }
 *
 * let notificationWs: NotificationWebSocket | null = null
 *
 * export function useNotificationWebSocket(handler?: MessageHandler<NotificationMessage>) {
 *   if (!notificationWs) {
 *     notificationWs = new NotificationWebSocket()
 *   }
 *   return createWebSocketComposable(notificationWs, handler)
 * }
 * ```
 */
export function createWebSocketComposable<T extends WebSocketMessage>(
  ws: BaseWebSocket<T>,
  handler?: MessageHandler<T>,
) {
  if (handler) {
    ws.addHandler(handler)
  }

  onUnmounted(() => {
    if (handler) {
      ws.removeHandler(handler)
    }
  })

  return {
    connect: () => ws.connect(),
    disconnect: () => ws.disconnect(),
    send: (data: any) => ws.send(data),
    status: ws.status,
    addHandler: (h: MessageHandler<T>) => ws.addHandler(h),
    removeHandler: (h: MessageHandler<T>) => ws.removeHandler(h),
  }
}

/**
 * 配置更新消息类型
 */
export interface ConfigUpdate extends WebSocketMessage {
  type: "config_update"
  key: string
  value: any
}

/**
 * 配置 WebSocket 连接管理类
 */
class ConfigWebSocket extends BaseWebSocket<ConfigUpdate> {
  constructor() {
    super({
      path: "config",
    })
  }

  /**
   * 发送配置更新
   */
  updateConfig(key: string, value: any) {
    this.send({
      type: "config_update",
      key,
      value,
    })
  }
}

/**
 * 用于组件中使用配置 WebSocket 的 Composable
 */
export function useConfigWebSocket(handler?: MessageHandler<ConfigUpdate>) {
  const ws = new ConfigWebSocket()

  onMounted(() => {
    if (handler) {
      ws.addHandler(handler)
    }
  })

  onUnmounted(() => {
    if (handler) {
      ws.removeHandler(handler)
    }
    ws.disconnect()
  })

  return {
    connect: () => ws.connect(),
    disconnect: () => ws.disconnect(),
    updateConfig: (key: string, value: any) => ws.updateConfig(key, value),
    status: ws.status,
    addHandler: (h: MessageHandler<ConfigUpdate>) => ws.addHandler(h),
    removeHandler: (h: MessageHandler<ConfigUpdate>) => ws.removeHandler(h),
  }
}

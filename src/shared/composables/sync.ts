import { useMessage } from "naive-ui"
import { useUserStore } from "../store/user"
import type { EditorView } from "@codemirror/view"
import { Compartment } from "@codemirror/state"
import type { WebrtcProvider } from "y-webrtc"
import type { Doc, Text } from "yjs"

// 常量定义
const SYNC_CONSTANTS = {
  MAX_ROOM_USERS: 2,
  AWARENESS_SYNC_DELAY: 500,
  INIT_SYNC_TIMEOUT: 500,
  SUPER_ADMIN_COLOR: "#ff6b6b",
  REGULAR_USER_COLOR: "#4dabf7",
} as const

// 错误类型码
export const SYNC_ERROR_CODES = {
  SUPER_ADMIN_LEFT: "SUPER_ADMIN_LEFT",
  MISSING_SUPER_ADMIN: "MISSING_SUPER_ADMIN",
} as const

// 界面和通知文案
export const SYNC_MESSAGES = {
  // 超管离开
  SUPER_ADMIN_LEFT: (name: string) => `👋 超管 ${name} 已离开`,

  // 缺少超管
  MISSING_SUPER_ADMIN: "⚠️ 协同编辑需要超管",

  // 连接成功
  SYNC_ACTIVE: "✅ 协同编辑已激活！",

  // 连接断开
  CONNECTION_LOST: "⚠️ 协同编辑已断开",

  // 等待相关
  WAITING_STUDENT: "⏳ 正在等待学生加入...",
  WAITING_ADMIN: "⏳ 正在等待超管加入...",

  // Form.vue 界面文案
  SYNC_ON: "断开同步",
  SYNC_OFF: "开启同步",
  SYNCING_WITH: (name: string) => `🔗 与 ${name} 同步中`,
  STUDENT_LEFT: (name?: string) => name ? `💡 ${name}已离开` : "💡 可以关闭同步",
} as const

// 类型定义
type SyncState = "waiting" | "active" | "error"
type SyncErrorCode = (typeof SYNC_ERROR_CODES)[keyof typeof SYNC_ERROR_CODES]

interface UserInfo {
  name: string
  isSuperAdmin: boolean
}

interface PeersEvent {
  webrtcPeers: string[]
}

interface StatusEvent {
  connected: boolean
}

interface SyncedEvent {
  synced: boolean
}

interface SyncOptions {
  problemId: string
  editorView: EditorView
  onStatusChange?: (status: SyncStatus) => void
}

export interface SyncStatus {
  connected: boolean
  roomUsers: number
  canSync: boolean
  message: string
  error?: string
  errorCode?: SyncErrorCode
  otherUser?: UserInfo
}

/**
 * 代码同步 composable
 * 每次调用创建新的同步实例
 */
export function useCodeSync() {
  const userStore = useUserStore()
  const message = useMessage()

  // 每次调用创建新的实例变量
  let ydoc: Doc | null = null
  let provider: WebrtcProvider | null = null
  let ytext: Text | null = null
  const collabCompartment = new Compartment()
  let currentEditorView: EditorView | null = null
  let lastSyncState: SyncState | null = null
  let roomUserInfo = new Map<number, UserInfo>()
  let hasShownSuperAdminLeftMessage = false

  const updateStatus = (
    status: SyncStatus,
    onStatusChange?: (status: SyncStatus) => void,
  ) => {
    onStatusChange?.(status)
  }

  const normalizeClientId = (clientId: number | string): number => {
    return typeof clientId === "string" ? parseInt(clientId, 10) : clientId
  }

  const checkHasSuperAdmin = (awarenessStates: Map<number, any>): boolean => {
    if (userStore.isSuperAdmin) return true
    return Array.from(awarenessStates.values()).some(
      (state) => state.user?.isSuperAdmin,
    )
  }

  const getOtherUserInfo = (
    awarenessStates: Map<number, any>,
  ): UserInfo | undefined => {
    if (!provider) return undefined

    const localClientId = provider.awareness.clientID
    for (const [clientId, state] of awarenessStates) {
      if (clientId !== localClientId && state.user) {
        return {
          name: state.user.name,
          isSuperAdmin: state.user.isSuperAdmin,
        }
      }
    }
    return undefined
  }

  const checkIfSuperAdminLeft = (
    removedClientIds: number[],
    onStatusChange?: (status: SyncStatus) => void,
  ) => {
    if (userStore.isSuperAdmin || hasShownSuperAdminLeftMessage) return

    const superAdminInfo = removedClientIds
      .map((id) => roomUserInfo.get(id))
      .find((info) => info?.isSuperAdmin)

    if (superAdminInfo) {
      hasShownSuperAdminLeftMessage = true
      const leftMessage = SYNC_MESSAGES.SUPER_ADMIN_LEFT(superAdminInfo.name)
      updateStatus(
        {
          connected: false,
          roomUsers: 0,
          canSync: false,
          message: leftMessage,
          error: leftMessage,
          errorCode: SYNC_ERROR_CODES.SUPER_ADMIN_LEFT,
        },
        onStatusChange,
      )
      message.warning(leftMessage)
      stopSync()
    }
  }

  const checkRoomPermissions = (
    roomUsers: number,
    onStatusChange?: (status: SyncStatus) => void,
  ) => {
    const awarenessStates = provider?.awareness.getStates()
    if (!awarenessStates) return

    const hasSuperAdmin = checkHasSuperAdmin(awarenessStates)
    const canSync = roomUsers === SYNC_CONSTANTS.MAX_ROOM_USERS && hasSuperAdmin
    const otherUser = getOtherUserInfo(awarenessStates)

    if (roomUsers === SYNC_CONSTANTS.MAX_ROOM_USERS && !hasSuperAdmin) {
      if (lastSyncState === "error") return

      updateStatus(
        {
          connected: false,
          roomUsers,
          canSync: false,
          message: SYNC_MESSAGES.MISSING_SUPER_ADMIN,
          error: SYNC_MESSAGES.MISSING_SUPER_ADMIN,
          errorCode: SYNC_ERROR_CODES.MISSING_SUPER_ADMIN,
          otherUser,
        },
        onStatusChange,
      )
      message.error(SYNC_MESSAGES.MISSING_SUPER_ADMIN)
      lastSyncState = "error"
      stopSync()
      return
    } else if (canSync) {
      updateStatus(
        {
          connected: true,
          roomUsers,
          canSync: true,
          message: SYNC_MESSAGES.SYNC_ACTIVE,
          otherUser,
        },
        onStatusChange,
      )
      if (lastSyncState !== "active") {
        message.success(SYNC_MESSAGES.SYNC_ACTIVE)
        lastSyncState = "active"
      }
    } else {
      updateStatus(
        {
          connected: true,
          roomUsers,
          canSync: false,
          message:
            roomUsers === 1
              ? SYNC_MESSAGES.WAITING_STUDENT
              : SYNC_MESSAGES.WAITING_ADMIN,
          otherUser,
        },
        onStatusChange,
      )
      lastSyncState = "waiting"
    }
  }

  const setupContentSync = (
    ytext: Text,
    provider: WebrtcProvider,
    savedContent: string,
  ) => {
    let hasInitialized = false

    const initTimeout = setTimeout(() => {
      if (!hasInitialized && ytext.length === 0 && savedContent) {
        ytext.insert(0, savedContent)
      }
      hasInitialized = true
    }, SYNC_CONSTANTS.INIT_SYNC_TIMEOUT)

    provider.on("synced", (event: SyncedEvent) => {
      if (!event.synced || hasInitialized) return

      clearTimeout(initTimeout)
      if (ytext.length === 0 && savedContent) {
        ytext.insert(0, savedContent)
      }
      hasInitialized = true
    })
  }

  async function startSync(options: SyncOptions): Promise<() => void> {
    const { problemId, editorView, onStatusChange } = options

    if (!userStore.isAuthed) {
      return () => {}
    }

    // 动态导入 yjs 相关模块
    const [Y, { WebrtcProvider }, { yCollab }] = await Promise.all([
      import("yjs"),
      import("y-webrtc"),
      import("y-codemirror.next"),
    ])

    // 初始化文档和提供者
    ydoc = new Y.Doc()
    ytext = ydoc.getText("codemirror")
    const roomName = `problem-${problemId}`

    provider = new WebrtcProvider(roomName, ydoc, {
      signaling: [import.meta.env.PUBLIC_SIGNALING_URL],
      maxConns: 1,
      filterBcConns: true,
    })

    // 监听连接状态
    provider.on("status", (event: StatusEvent) => {
      if (!event.connected) {
        updateStatus(
          {
            connected: false,
            roomUsers: 0,
            canSync: false,
            message: SYNC_MESSAGES.CONNECTION_LOST,
            error: SYNC_MESSAGES.CONNECTION_LOST,
          },
          onStatusChange,
        )
        message.warning(SYNC_MESSAGES.CONNECTION_LOST)
      }
    })

    // 监听用户加入/离开
    provider.on("peers", (event: PeersEvent) => {
      const roomUsers = event.webrtcPeers.length + 1
      setTimeout(() => {
        checkRoomPermissions(roomUsers, onStatusChange)
      }, SYNC_CONSTANTS.AWARENESS_SYNC_DELAY)
    })

    // 监听 awareness 变化
    provider.awareness.on("change", (changes: any) => {
      if (!provider) return

      const awarenessStates = provider.awareness.getStates()

      if (changes.removed?.length > 0) {
        checkIfSuperAdminLeft(changes.removed, onStatusChange)
      }

      awarenessStates.forEach((state, clientId) => {
        if (state.user) {
          const normalizedId = normalizeClientId(clientId)
          roomUserInfo.set(normalizedId, {
            name: state.user.name,
            isSuperAdmin: state.user.isSuperAdmin,
          })
        }
      })

      checkRoomPermissions(awarenessStates.size, onStatusChange)
    })

    // 配置编辑器扩展
    if (editorView && ytext) {
      currentEditorView = editorView
      const userColor = userStore.isSuperAdmin
        ? SYNC_CONSTANTS.SUPER_ADMIN_COLOR
        : SYNC_CONSTANTS.REGULAR_USER_COLOR
      const userName = userStore.user?.username || "匿名用户"
      const savedContent = editorView.state.doc.toString()

      // 设置用户信息
      provider.awareness.setLocalStateField("user", {
        name: userName,
        color: userColor,
        isSuperAdmin: userStore.isSuperAdmin,
      })

      // 清空编辑器并应用协同扩展
      editorView.dispatch({
        changes: { from: 0, to: editorView.state.doc.length, insert: "" },
      })

      const collabExt = yCollab(ytext, provider.awareness)
      editorView.dispatch({
        effects: collabCompartment.reconfigure(collabExt),
      })

      // 设置内容同步
      setupContentSync(ytext, provider, savedContent)

      // 设置初始状态
      const waitingMessage = userStore.isSuperAdmin
        ? SYNC_MESSAGES.WAITING_STUDENT
        : SYNC_MESSAGES.WAITING_ADMIN

      updateStatus(
        {
          connected: true,
          roomUsers: 1,
          canSync: false,
          message: waitingMessage,
        },
        onStatusChange,
      )

      message.info(waitingMessage)
      lastSyncState = "waiting"
    }

    return () => stopSync()
  }

  function stopSync() {
    if (currentEditorView) {
      try {
        currentEditorView.dispatch({
          effects: collabCompartment.reconfigure([]),
        })
      } catch (error) {
        console.warn("移除协同编辑扩展失败:", error)
      }
      currentEditorView = null
    }

    provider?.disconnect()
    provider?.destroy()
    ydoc?.destroy()

    provider = null
    ydoc = null
    ytext = null
    lastSyncState = null
    roomUserInfo.clear()
    hasShownSuperAdminLeftMessage = false
  }

  function getInitialExtension() {
    return collabCompartment.of([])
  }

  return {
    startSync,
    stopSync,
    getInitialExtension,
  }
}

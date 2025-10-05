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

// 类型定义
type SyncState = "waiting" | "active" | "error"

interface UserInfo {
  name: string
  isSuperAdmin: boolean
}

interface PeersEvent {
  added: string[]
  removed: string[]
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
  otherUser?: UserInfo
}

export function useCodeSync() {
  const userStore = useUserStore()
  const message = useMessage()

  // 状态变量
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
      updateStatus(
        {
          connected: false,
          roomUsers: 0,
          canSync: false,
          message: `超管 ${superAdminInfo.name} 已退出`,
          error: "超管已离开",
        },
        onStatusChange,
      )
      message.warning(`超管 ${superAdminInfo.name} 溜了，协同编辑已断开连接`)
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
      updateStatus(
        {
          connected: true,
          roomUsers,
          canSync: false,
          message: "房间内必须有一个超级管理员",
          error: "缺少超级管理员",
          otherUser,
        },
        onStatusChange,
      )
      if (lastSyncState !== "error") {
        message.warning("协同编辑需要一位超级管理员坐镇哦")
        lastSyncState = "error"
      }
    } else if (canSync) {
      updateStatus(
        {
          connected: true,
          roomUsers,
          canSync: true,
          message: "协同编辑已激活，开始愉快的代码之旅吧！",
          otherUser,
        },
        onStatusChange,
      )
      if (lastSyncState !== "active") {
        message.success("协同编辑已激活，开始愉快的代码之旅吧！")
        lastSyncState = "active"
      }
    } else {
      updateStatus(
        {
          connected: true,
          roomUsers,
          canSync: false,
          message:
            roomUsers === 1 ? "正在等待小伙伴加入..." : "等待超级管理员加入...",
          otherUser,
        },
        onStatusChange,
      )
      lastSyncState = "waiting"
    }
  }

  const setupContentSync = (
    editorView: EditorView,
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

    console.log("Yjs 相关模块导入完成")

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
            message: "连接已断开",
            error: "WebRTC 连接断开",
          },
          onStatusChange,
        )
        message.warning("协同编辑连接已断开")
      }
    })

    // 监听用户加入/离开
    provider.on("peers", (event: PeersEvent) => {
      const roomUsers = event.webrtcPeers.length + 1

      if (roomUsers > SYNC_CONSTANTS.MAX_ROOM_USERS) {
        updateStatus(
          {
            connected: false,
            roomUsers,
            canSync: false,
            message: "房间人数已满，已自动断开连接",
            error: `房间最多只能有${SYNC_CONSTANTS.MAX_ROOM_USERS}个人`,
          },
          onStatusChange,
        )
        message.warning(`哎呀，房间已经坐满了，已自动断开连接`)
        stopSync()
        return
      }

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
      setupContentSync(editorView, ytext, provider, savedContent)

      // 设置初始状态
      updateStatus(
        {
          connected: true,
          roomUsers: 1,
          canSync: false,
          message: "协同编辑已准备就绪，等待伙伴加入...",
        },
        onStatusChange,
      )

      message.info(
        userStore.isSuperAdmin
          ? "正在等待学生加入房间..."
          : "正在等待超管加入房间...",
      )
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

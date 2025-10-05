// 同步状态管理 composable

export interface SyncStatusState {
  otherUser?: { name: string; isSuperAdmin: boolean }
  hadConnection: boolean
}

// 提供/注入的 key
export const SYNC_STATUS_KEY = Symbol("syncStatus")

// 创建同步状态
export function createSyncStatus() {
  const otherUser = ref<{ name: string; isSuperAdmin: boolean }>()
  const hadConnection = ref(false)

  const setOtherUser = (user?: { name: string; isSuperAdmin: boolean }) => {
    otherUser.value = user
    if (user) {
      hadConnection.value = true
    }
  }

  const reset = () => {
    otherUser.value = undefined
    hadConnection.value = false
  }

  return {
    otherUser,
    hadConnection,
    setOtherUser,
    reset,
  }
}

// 提供同步状态
export function provideSyncStatus() {
  const syncStatus = createSyncStatus()
  provide(SYNC_STATUS_KEY, syncStatus)
  return syncStatus
}

// 注入同步状态
export function injectSyncStatus() {
  const syncStatus =
    inject<ReturnType<typeof createSyncStatus>>(SYNC_STATUS_KEY)
  if (!syncStatus) {
    throw new Error("syncStatus must be provided by a parent component")
  }
  return syncStatus
}

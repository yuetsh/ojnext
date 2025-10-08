import { ref, provide, inject } from "vue"

/**
 * 同步状态管理 composable
 * 使用 provide/inject 模式在组件树中共享状态
 */

export interface SyncStatusState {
  hadConnection: boolean
  otherUser?: { name: string; isSuperAdmin: boolean }
  lastLeftUser?: { name: string; isSuperAdmin: boolean } // 保存离开之人的信息
}

// 提供/注入的 key
export const SYNC_STATUS_KEY = Symbol("syncStatus")

/**
 * 创建同步状态实例
 * 每次调用创建新的状态实例
 */
export function createSyncStatus() {
  const otherUser = ref<{ name: string; isSuperAdmin: boolean }>()
  const hadConnection = ref(false)
  const lastLeftUser = ref<{ name: string; isSuperAdmin: boolean }>()

  const setOtherUser = (user?: { name: string; isSuperAdmin: boolean }) => {
    // 如果之前有其他用户，现在没有了，说明用户离开了
    if (otherUser.value && !user) {
      lastLeftUser.value = otherUser.value
    }
    otherUser.value = user
    if (user) {
      hadConnection.value = true
    }
  }

  const reset = () => {
    otherUser.value = undefined
    hadConnection.value = false
    lastLeftUser.value = undefined
  }

  return {
    otherUser,
    hadConnection,
    lastLeftUser,
    setOtherUser,
    reset,
  }
}

/**
 * 提供同步状态到子组件
 * 在父组件中调用
 */
export function provideSyncStatus() {
  const syncStatus = createSyncStatus()
  provide(SYNC_STATUS_KEY, syncStatus)
  return syncStatus
}

/**
 * 注入同步状态
 * 在子组件中调用，获取父组件提供的状态
 */
export function injectSyncStatus() {
  const syncStatus =
    inject<ReturnType<typeof createSyncStatus>>(SYNC_STATUS_KEY)
  if (!syncStatus) {
    throw new Error("syncStatus must be provided by a parent component")
  }
  return syncStatus
}

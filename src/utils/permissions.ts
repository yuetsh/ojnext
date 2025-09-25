import { useUserStore } from "~/shared/store/user"

/**
 * 权限检查工具函数
 */
export function usePermissions() {
  const userStore = useUserStore()

  return {
    // 基本权限检查
    isAuthenticated: computed(() => userStore.isAuthed),
    isAdminRole: computed(() => userStore.isAdminRole),
    isSuperAdmin: computed(() => userStore.isSuperAdmin),
    hasProblemPermission: computed(() => userStore.hasProblemPermission),

    // 功能权限检查
    canManageUsers: computed(() => userStore.isSuperAdmin),
    canManageAnnouncements: computed(() => userStore.isSuperAdmin),
    canManageComments: computed(() => userStore.isSuperAdmin),
    canManageTutorials: computed(() => userStore.isSuperAdmin),
    canManageSystemConfig: computed(() => userStore.isSuperAdmin),
    canSendMessages: computed(() => userStore.isSuperAdmin),

    canManageProblems: computed(() => userStore.hasProblemPermission),
    canManageContests: computed(() => userStore.isSuperAdmin),

    // 题目权限细分检查
    canManageAllProblems: computed(
      () =>
        userStore.user?.problem_permission === "All" || userStore.isSuperAdmin,
    ),
    canManageOwnProblems: computed(
      () =>
        userStore.user?.problem_permission === "Own" && !userStore.isSuperAdmin,
    ),

    // 获取用户权限级别描述
    getUserPermissionLevel: computed(() => {
      if (userStore.isSuperAdmin) return "超级管理员"
      if (userStore.isAdminRole) return "管理员"
      return "普通用户"
    }),

    // 获取题目权限描述
    getProblemPermissionLevel: computed(() => {
      if (!userStore.user) return "无权限"

      switch (userStore.user.problem_permission) {
        case "All":
          return "管理所有题目"
        case "Own":
          return "管理自己的题目"
        case "None":
          return "无题目权限"
        default:
          return "无权限"
      }
    }),
  }
}

/**
 * 路由权限检查
 */
export function checkRoutePermission(routeName: string): boolean {
  const userStore = useUserStore()

  // 需要super admin权限的路由
  const superAdminRoutes = [
    "admin home",
    "admin config",
    "admin user list",
    "admin user generate",
    "admin announcement list",
    "admin announcement create",
    "admin announcement edit",
    "admin comment list",
    "admin message list",
    "admin tutorial list",
    "admin tutorial create",
    "admin tutorial edit",
    "admin contest list",
    "admin contest create",
    "admin contest edit",
    "admin contest problem list",
    "admin contest problem create",
    "admin contest problem edit",
  ]

  // 需要题目权限的路由
  const problemPermissionRoutes = [
    "admin problem list",
    "admin problem create",
    "admin problem edit",
  ]

  // 需要基本admin权限的路由
  const adminRoutes: string[] = ["admin problem list"]

  if (superAdminRoutes.includes(routeName)) {
    return userStore.isSuperAdmin
  }

  if (problemPermissionRoutes.includes(routeName)) {
    return userStore.hasProblemPermission
  }

  if (adminRoutes.includes(routeName)) {
    return userStore.isAdminRole
  }

  return true
}

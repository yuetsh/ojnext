import { useUserStore } from "shared/store/user"

export function usePermissions() {
  const userStore = useUserStore()

  return {
    isAuthenticated: computed(() => userStore.isAuthed),
    isAdminRole: computed(() => userStore.isAdminRole),
    isTeacherOrAbove: computed(() => userStore.isTeacherOrAbove),
    isSuperAdmin: computed(() => userStore.isSuperAdmin),
    hasProblemPermission: computed(() => userStore.hasProblemPermission),

    canManageUsers: computed(() => userStore.isSuperAdmin),
    canManageAnnouncements: computed(() => userStore.isSuperAdmin),
    canManageComments: computed(() => userStore.isSuperAdmin),
    canManageTutorials: computed(() => userStore.isSuperAdmin),
    canManageSystemConfig: computed(() => userStore.isSuperAdmin),
    canSendMessages: computed(() => userStore.isSuperAdmin),

    canManageProblems: computed(() => userStore.hasProblemPermission),
    canManageContests: computed(() => userStore.isTeacherOrAbove),
    canManageProblemsets: computed(() => userStore.isTeacherOrAbove),
    canViewClassroomData: computed(() => userStore.isTeacherOrAbove),

    canManageAllProblems: computed(
      () =>
        userStore.user?.problem_permission === "All" || userStore.isSuperAdmin,
    ),
    canManageOwnProblems: computed(
      () =>
        userStore.user?.problem_permission === "Own" && !userStore.isSuperAdmin,
    ),

    getUserPermissionLevel: computed(() => {
      if (userStore.isSuperAdmin) return "超级管理员"
      if (userStore.isTeacherAdmin) return "教师管理员"
      if (userStore.isStudentAdmin) return "学生管理员"
      return "普通用户"
    }),

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

export function checkRoutePermission(routeName: string): boolean {
  const userStore = useUserStore()

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
  ]

  const teacherAdminRoutes = [
    "admin contest list",
    "admin contest create",
    "admin contest edit",
    "admin contest problem list",
    "admin contest problem create",
    "admin contest problem edit",
    "admin contest helper",
    "admin problemset list",
    "admin problemset create",
    "admin problemset edit",
    "admin problemset detail",
  ]

  const problemPermissionRoutes = [
    "admin problem list",
    "admin problem create",
    "admin problem edit",
  ]

  if (superAdminRoutes.includes(routeName)) {
    return userStore.isSuperAdmin
  }

  if (teacherAdminRoutes.includes(routeName)) {
    return userStore.isTeacherOrAbove
  }

  if (problemPermissionRoutes.includes(routeName)) {
    return userStore.hasProblemPermission
  }

  return true
}

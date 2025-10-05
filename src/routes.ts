import { RouteRecordRaw } from "vue-router"

export const ojs: RouteRecordRaw = {
  path: "/",
  component: () => import("shared/layout/default.vue"),
  children: [
    { path: "", component: () => import("oj/problem/list.vue") },
    {
      path: "problem/:problemID",
      component: () => import("oj/problem/detail.vue"),
      props: true,
      name: "problem",
    },
    {
      path: "submission",
      component: () => import("oj/submission/list.vue"),
      name: "submissions",
    },
    {
      path: "submission/:submissionID",
      component: () => import("oj/submission/detail.vue"),
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: "contest",
      component: () => import("oj/contest/list.vue"),
      name: "contests",
    },
    {
      path: "contest/:contestID",
      component: () => import("oj/contest/detail.vue"),
      props: true,
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          component: () => import("oj/contest/pages/problems.vue"),
          props: true,
          meta: { requiresAuth: true },
          name: "contest problems",
        },
        {
          path: "submission",
          component: () => import("oj/submission/list.vue"),
          meta: { requiresAuth: true },
          name: "contest submissions",
        },
        {
          path: "rank",
          component: () => import("oj/contest/pages/rank.vue"),
          props: true,
          meta: { requiresAuth: true },
          name: "contest rank",
        },
      ],
    },
    {
      path: "contest/:contestID/problem/:problemID",
      component: () => import("oj/problem/detail.vue"),
      props: true,
      name: "contest problem",
      meta: { requiresAuth: true },
    },
    {
      path: "rank",
      component: () => import("oj/rank/list.vue"),
    },
    {
      path: "announcement",
      component: () => import("oj/announcement/list.vue"),
    },
    {
      path: "user",
      component: () => import("oj/user/index.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "setting",
      component: () => import("oj/user/setting.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "message",
      component: () => import("oj/user/message.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "learn/:step+",
      name: "learn",
      component: () => import("oj/learn/index.vue"),
      props: true,
    },
    {
      path: "ai-analysis",
      component: () => import("oj/ai/analysis.vue"),
      meta: { requiresAuth: true },
    },
  ],
}

export const admins: RouteRecordRaw = {
  path: "/admin",
  component: () => import("shared/layout/admin.vue"),
  children: [
    {
      path: "",
      name: "admin home",
      component: () => import("admin/setting/home.vue"),
      meta: { requiresSuperAdmin: true },
    },
    {
      path: "config",
      name: "admin config",
      component: () => import("admin/setting/config.vue"),
      meta: { requiresSuperAdmin: true },
    },
    {
      path: "user/list",
      name: "admin user list",
      component: () => import("admin/user/list.vue"),
      meta: { requiresSuperAdmin: true },
    },
    {
      path: "user/generate",
      name: "admin user generate",
      component: () => import("admin/user/generate.vue"),
      meta: { requiresSuperAdmin: true },
    },
    // admin和super_admin都可以访问的路由 (需要题目权限)
    {
      path: "problem/list",
      name: "admin problem list",
      component: () => import("admin/problem/list.vue"),
      meta: { requiresProblemPermission: true },
    },
    {
      path: "problem/create",
      name: "admin problem create",
      component: () => import("admin/problem/detail.vue"),
      meta: { requiresProblemPermission: true },
    },
    {
      path: "problem/edit/:problemID",
      name: "admin problem edit",
      component: () => import("admin/problem/detail.vue"),
      props: true,
      meta: { requiresProblemPermission: true },
    },
    {
      path: "contest/list",
      name: "admin contest list",
      component: () => import("admin/contest/list.vue"),
      meta: { requiresSuperAdmin: true },
    },
    {
      path: "contest/create",
      name: "admin contest create",
      component: () => import("admin/contest/detail.vue"),
      meta: { requiresSuperAdmin: true },
    },
    {
      path: "contest/edit/:contestID",
      name: "admin contest edit",
      component: () => import("admin/contest/detail.vue"),
      props: true,
      meta: { requiresSuperAdmin: true },
    },
    {
      path: "contest/:contestID/problem/list",
      name: "admin contest problem list",
      component: () => import("admin/problem/list.vue"),
      props: true,
      meta: { requiresSuperAdmin: true },
    },
    {
      path: "contest/:contestID/problem/create",
      name: "admin contest problem create",
      component: () => import("admin/problem/detail.vue"),
      props: true,
      meta: { requiresSuperAdmin: true },
    },
    {
      path: "contest/:contestID/problem/edit/:problemID",
      name: "admin contest problem edit",
      component: () => import("admin/problem/detail.vue"),
      props: true,
      meta: { requiresSuperAdmin: true },
    },
    {
      path: "contest/:contestID/helper",
      name: "admin contest helper",
      component: () => import("admin/contest/helper.vue"),
      props: true,
      meta: { requiresSuperAdmin: true },
    },
    // 只有super_admin可以访问的路由
    {
      path: "announcement/list",
      name: "admin announcement list",
      component: () => import("admin/announcement/list.vue"),
      meta: { requiresSuperAdmin: true },
    },
    {
      path: "announcement/create",
      name: "admin announcement create",
      component: () => import("admin/announcement/detail.vue"),
      meta: { requiresSuperAdmin: true },
    },
    {
      path: "announcement/edit/:announcementID",
      name: "admin announcement edit",
      component: () => import("admin/announcement/detail.vue"),
      props: true,
      meta: { requiresSuperAdmin: true },
    },
    {
      path: "comment/list",
      name: "admin comment list",
      component: () => import("admin/communication/comments.vue"),
      meta: { requiresSuperAdmin: true },
    },
    {
      path: "message/list",
      name: "admin message list",
      component: () => import("admin/communication/messages.vue"),
      meta: { requiresSuperAdmin: true },
    },
    {
      path: "tutorial/list",
      name: "admin tutorial list",
      component: () => import("admin/tutorial/list.vue"),
      meta: { requiresSuperAdmin: true },
    },
    {
      path: "tutorial/create",
      name: "admin tutorial create",
      component: () => import("admin/tutorial/detail.vue"),
      meta: { requiresSuperAdmin: true },
    },
    {
      path: "tutorial/edit/:tutorialID",
      name: "admin tutorial edit",
      component: () => import("admin/tutorial/detail.vue"),
      props: true,
      meta: { requiresSuperAdmin: true },
    },
  ],
}

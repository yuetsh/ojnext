import { RouteRecordRaw } from "vue-router"
import { loadChart } from "./shared/composables/chart"

export const ojs: RouteRecordRaw = {
  path: "/",
  component: () => import("~/shared/layout/default.vue"),
  children: [
    { path: "", component: () => import("oj/problem/list.vue") },
    {
      path: "problem/:problemID",
      component: () => import("oj/problem/detail.vue"),
      props: true,
      name: "problem",
      beforeEnter: loadChart,
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
      beforeEnter: loadChart,
    },
    {
      path: "rank",
      component: () => import("oj/rank/list.vue"),
      beforeEnter: loadChart,
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
    }
  ],
}

export const admins: RouteRecordRaw = {
  path: "/admin",
  component: () => import("~/shared/layout/admin.vue"),
  children: [
    {
      path: "",
      name: "admin home",
      component: () => import("~/admin/setting/home.vue"),
    },
    {
      path: "config",
      name: "admin config",
      component: () => import("admin/setting/config.vue"),
    },
    {
      path: "user/list",
      name: "admin user list",
      component: () => import("admin/user/list.vue"),
    },
    {
      path: "user/generate",
      name: "admin user generate",
      component: () => import("~/admin/user/generate.vue"),
    },
    {
      path: "problem/list",
      name: "admin problem list",
      component: () => import("admin/problem/list.vue"),
    },
    {
      path: "problem/create",
      name: "admin problem create",
      component: () => import("admin/problem/detail.vue"),
    },
    {
      path: "problem/edit/:problemID",
      name: "admin problem edit",
      component: () => import("admin/problem/detail.vue"),
      props: true,
    },
    {
      path: "contest/list",
      name: "admin contest list",
      component: () => import("admin/contest/list.vue"),
    },
    {
      path: "contest/create",
      name: "admin contest create",
      component: () => import("admin/contest/detail.vue"),
    },
    {
      path: "contest/edit/:contestID",
      name: "admin contest edit",
      component: () => import("admin/contest/detail.vue"),
      props: true,
    },
    {
      path: "contest/:contestID/problem/list",
      name: "admin contest problem list",
      component: () => import("admin/problem/list.vue"),
      props: true,
    },
    {
      path: "contest/:contestID/problem/create",
      name: "admin contest problem create",
      component: () => import("admin/problem/detail.vue"),
      props: true,
    },
    {
      path: "contest/:contestID/problem/edit/:problemID",
      name: "admin contest problem edit",
      component: () => import("admin/problem/detail.vue"),
      props: true,
    },
    {
      path: "announcement/list",
      name: "admin announcement list",
      component: () => import("admin/announcement/list.vue"),
    },
    {
      path: "announcement/create",
      name: "admin announcement create",
      component: () => import("admin/announcement/detail.vue"),
    },
    {
      path: "announcement/edit/:announcementID",
      name: "admin announcement edit",
      component: () => import("admin/announcement/detail.vue"),
      props: true,
    },
  ],
}

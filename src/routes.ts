import { RouteRecordRaw } from "vue-router"
import { loadChart } from "./shared/composables/chart"

export const routes: RouteRecordRaw[] = [
  {
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
        path: "learn",
        redirect: "learn/step-1",
      },
      {
        path: "learn/:step+",
        component: () => import("learn/index.vue"),
        name: "learn",
      },
    ],
  },
  {
    path: "/admin",
    component: () => import("~/shared/layout/admin.vue"),
    children: [{ path: "", component: () => import("admin/index.vue") }],
  },
]

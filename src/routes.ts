import { RouteRecordRaw } from "vue-router"
import { getProfile } from "./shared/api"
import { loadChart } from "./shared/composables/chart"
import { STORAGE_KEY, USER_TYPE } from "./utils/constants"
import storage from "./utils/storage"

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
    beforeEnter: async () => {
      if (!storage.get(STORAGE_KEY.AUTHED)) return "/"
      const res = await getProfile()
      if (res.data.user.admin_type === USER_TYPE.REGULAR_USER) return "/"
    },
    children: [
      {
        path: "",
        name: "home",
        component: () => import("~/admin/setting/home.vue"),
      },
      {
        path: "config",
        name: "config",
        component: () => import("admin/setting/config.vue"),
      },
      {
        path: "announcement",
        name: "announcement",
        component: () => import("admin/setting/announcement.vue"),
      },
      {
        path: "user/list",
        name: "user list",
        component: () => import("admin/user/list.vue"),
      },
      {
        path: "user/importing",
        name: "user importing",
        component: () => import("admin/user/import.vue"),
      },
      {
        path: "problem/list",
        name: "problem list",
        component: () => import("admin/problem/list.vue"),
      },
      {
        path: "problem/create",
        name: "problem create",
        component: () => import("admin/problem/detail.vue"),
      },
      {
        path: "problem/edit/:problemID",
        name: "problem edit",
        component: () => import("admin/problem/detail.vue"),
        props: true,
      },
      {
        path: "contest/list",
        name: "contest list",
        component: () => import("admin/contest/list.vue"),
      },
      {
        path: "contest/create",
        name: "contest create",
        component: () => import("admin/contest/detail.vue"),
      },
      {
        path: "contest/edit/:contestID",
        name: "contest edit",
        component: () => import("admin/contest/detail.vue"),
        props: true,
      },
      {
        path: "contest/:contestID/problems",
        name: "contest problems",
        component: () => import("admin/contest/detail.vue"),
        props: true,
      },
      {
        path: "contest/:contestID/problem/create",
        name: "contest problem create",
        component: () => import("admin/problem/detail.vue"),
        props: true,
      },
      {
        path: "contest/:contestID/problem/edit/:problemID",
        name: "contest problem edit",
        component: () => import("admin/problem/detail.vue"),
        props: true,
      },
    ],
  },
]

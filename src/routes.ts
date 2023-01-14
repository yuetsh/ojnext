export const routes = [
  {
    path: "/",
    component: () => import("~/shared/layout/default.vue"),
    children: [
      { path: "", component: () => import("oj/problem/list.vue") },
      {
        path: "problem/:problemID",
        component: () => import("oj/problem/detail.vue"),
        props: true,
        name: "ProblemDetail",
      },
      {
        path: "status",
        component: () => import("oj/status/list.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "status/:statusID",
        component: () => import("oj/status/detail.vue"),
        props: true,
      },
      {
        path: "contest",
        component: () => import("oj/contest/list.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "contest/:contestID",
        component: () => import("oj/contest/detail.vue"),
        props: true,
      },
      {
        path: "contest/:contestID/problem/:problemID",
        component: () => import("oj/problem/detail.vue"),
        props: true,
        name: "ContestProblemDetail",
      },
      {
        path: "rank",
        component: () => import("oj/rank/list.vue"),
      },
      {
        path: "learn",
        component: () => import("learn/index.vue"),
      },
    ],
  },
  {
    path: "/admin",
    component: () => import("~/shared/layout/admin.vue"),
    children: [{ path: "", component: () => import("admin/index.vue") }],
  },
]

import Home from "./oj/index.vue"
import Problems from "./oj/problem/list.vue"

const routes = [
  {
    path: "/",
    component: Home,
    children: [
      { path: "", component: Problems },
      {
        path: "problem/:problemID",
        component: () => import("./oj/problem/detail.vue"),
        props: true,
      },
      {
        path: "status",
        component: () => import("./oj/status/list.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "status/:statusID",
        component: () => import("./oj/status/detail.vue"),
        props: true,
      },
      {
        path: "contest",
        component: () => import("./oj/contest/list.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "contest/:contestID",
        component: () => import("./oj/contest/detail.vue"),
        props: true,
      },
      {
        path: "contest/:contestID/problem/:problemID",
        component: () => import("./oj/problem/detail.vue"),
        props: true,
      },
      {
        path: "rank",
        component: () => import("./oj/rank/list.vue"),
      },
    ],
  },
  { path: "/admin", component: () => import("./admin/index.vue") },
]

export default routes

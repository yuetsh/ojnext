import { createApp } from "vue"
import { createRouter, createWebHistory } from "vue-router"
import { createPinia } from "pinia"
import "normalize.css"
import "element-plus/theme-chalk/display.css"
import App from "./App.vue"

import Home from "./oj/index.vue"
import Problems from "./oj/problem/list.vue"
import storage from "./utils/storage"
import { STORAGE_KEY } from "./utils/constants"
import { useLoginStore } from "./shared/stores/login"

const routes = [
  {
    path: "/",
    component: Home,
    children: [
      { path: "", component: Problems },
      {
        path: "problem/:id",
        component: () => import("./oj/problem/detail.vue"),
      },
      {
        path: "status",
        component: () => import("./oj/status/list.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "status/:id",
        component: () => import("./oj/status/detail.vue"),
      },
      {
        path: "contest",
        component: () => import("./oj/contest/list.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "contest/:id",
        component: () => import("./oj/contest/detail.vue"),
      },
      {
        path: "rank",
        component: () => import("./oj/rank/list.vue"),
      },
    ],
  },
  { path: "/admin", component: () => import("./admin/index.vue") },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!storage.get(STORAGE_KEY.AUTHED)) {
      const login = useLoginStore()
      login.show()
      next("/")
    } else {
      next()
    }
  } else {
    next()
  }
})

const pinia = createPinia()

const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount("#app")

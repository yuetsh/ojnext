import { createApp } from "vue"
import { createRouter, createWebHistory } from "vue-router"
import { createPinia } from "pinia"
import "normalize.css"
import loader from "@monaco-editor/loader"

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
        path: "problem/:problemID",
        component: () => import("./oj/problem/detail.vue"),
      },
      {
        path: "status",
        component: () => import("./oj/status/list.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "status/:statusID",
        component: () => import("./oj/status/detail.vue"),
      },
      {
        path: "contest",
        component: () => import("./oj/contest/list.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "contest/:contestID",
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

loader.config({
  paths: { vs: "https://cdn.staticfile.org/monaco-editor/0.34.1/min/vs" },
  "vs/nls": { availableLanguages: { "*": "zh-cn" } },
})

const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount("#app")

import { createRouter, createWebHistory } from "vue-router"
import { createPinia } from "pinia"
import "normalize.css"
import loader from "@monaco-editor/loader"

import storage from "utils/storage"
import { STORAGE_KEY } from "utils/constants"

import { routes } from "./routes"
import App from "./App.vue"

import { useLoginStore } from "~/shared/store/login"

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

Promise.all([loader.init(), fetch("/dracula.json")]).then(([monaco, dark]) => {
  window.monaco = monaco
  dark.json().then((data) => monaco.editor.defineTheme("dark", data))
})

loader.config({
  paths: { vs: "https://cdn.staticfile.org/monaco-editor/0.34.1/min/vs" },
  "vs/nls": { availableLanguages: { "*": "zh-cn" } },
})

const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount("#app")

import { createRouter, createWebHistory } from "vue-router"
import { createPinia } from "pinia"
import "normalize.css"
import loader from "@monaco-editor/loader"

import storage from "utils/storage"
import { STORAGE_KEY } from "utils/constants"

import { routes } from "./routes"
import App from "./App.vue"

import { toggleLogin } from "./shared/composables/modal"

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!storage.get(STORAGE_KEY.AUTHED)) {
      toggleLogin(true)
      next("/")
    } else {
      next()
    }
  } else {
    next()
  }
})

const pinia = createPinia()

loader.init().then((monaco) => {
  window.monaco = monaco
  fetch("/dark.json").then((data) =>
    data.json().then((theme) => monaco.editor.defineTheme("dark", theme))
  )
  fetch("/light.json").then((data) =>
    data.json().then((theme) => monaco.editor.defineTheme("light", theme))
  )
})

loader.config({
  paths: { vs: "https://cdn.staticfile.org/monaco-editor/0.34.1/min/vs" },
  "vs/nls": { availableLanguages: { "*": "zh-cn" } },
})

const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount("#app")

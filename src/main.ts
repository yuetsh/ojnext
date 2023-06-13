import { createRouter, createWebHistory } from "vue-router"
import { createPinia } from "pinia"

import storage from "utils/storage"
import { STORAGE_KEY } from "utils/constants"

import { routes } from "./routes"
import App from "./App.vue"

import { toggleLogin } from "./shared/composables/modal"

const router = createRouter({
  history: createWebHistory(),
  routes: [routes],
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
const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount("#app")

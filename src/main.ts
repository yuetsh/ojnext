import { createPinia } from "pinia"
import { createRouter, createWebHistory } from "vue-router"

import { STORAGE_KEY } from "utils/constants"
import storage from "utils/storage"

import App from "./App.vue"
import { admins, ojs } from "./routes"

import { toggleLogin } from "./shared/composables/modal"

const router = createRouter({
  history: createWebHistory(),
  routes: [ojs, admins],
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

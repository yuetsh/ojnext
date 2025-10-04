import { addAPIProvider } from "@iconify/vue"
import { createPinia } from "pinia"
import { createRouter, createWebHistory } from "vue-router"

import { STORAGE_KEY } from "utils/constants"
import storage from "utils/storage"

import App from "./App.vue"
import { admins, ojs } from "./routes"

import { toggleLogin } from "./shared/composables/modal"
import { useUserStore } from "./shared/store/user"

const router = createRouter({
  history: createWebHistory(),
  routes: [ojs, admins],
})

router.beforeEach(async (to, from, next) => {
  // 检查是否需要认证
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!storage.get(STORAGE_KEY.AUTHED)) {
      toggleLogin(true)
      next("/")
      return
    }
  }

  // 检查权限
  if (
    to.matched.some(
      (record) =>
        record.meta.requiresSuperAdmin || record.meta.requiresProblemPermission,
    )
  ) {
    if (!storage.get(STORAGE_KEY.AUTHED)) {
      toggleLogin(true)
      next("/")
      return
    }

    const userStore = useUserStore()
    if (!userStore.user) {
      try {
        await userStore.getMyProfile()
      } catch (error) {
        next("/")
        return
      }
    }
    if (to.matched.some((record) => record.meta.requiresSuperAdmin)) {
      if (!userStore.isSuperAdmin) {
        next("/")
        return
      }
    } else if (
      to.matched.some((record) => record.meta.requiresProblemPermission)
    ) {
      if (!userStore.hasProblemPermission) {
        next("/")
        return
      }
    }
  }

  next()
})

const pinia = createPinia()
const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount("#app")

if (!!import.meta.env.PUBLIC_ICONIFY_URL) {
  addAPIProvider("", {
    resources: [import.meta.env.PUBLIC_ICONIFY_URL],
  })
}

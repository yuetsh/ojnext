import { addAPIProvider } from "@iconify/vue"
import { createPinia } from "pinia"
import { createRouter, createWebHistory } from "vue-router"

import {
  ArcElement,
  BarElement,
  BarController,
  CategoryScale,
  Chart as ChartJS,
  Colors,
  Legend,
  LinearScale,
  LineController,
  Title,
  Tooltip,
  LineElement,
  PointElement,
} from "chart.js"

import { STORAGE_KEY } from "utils/constants"
import storage from "utils/storage"

import App from "./App.vue"
import { admins, ojs } from "./routes"

import { toggleLogin } from "./shared/composables/modal"

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

  // 检查管理员权限
  if (to.matched.some((record) => 
    record.meta.requiresAdmin || 
    record.meta.requiresSuperAdmin || 
    record.meta.requiresProblemPermission
  )) {
    if (!storage.get(STORAGE_KEY.AUTHED)) {
      toggleLogin(true)
      next("/")
      return
    }

    // 动态导入用户store来检查权限
    const { useUserStore } = await import("./shared/store/user")
    const userStore = useUserStore()
    
    // 确保用户信息已加载
    if (!userStore.user) {
      try {
        await userStore.getMyProfile()
      } catch (error) {
        next("/")
        return
      }
    }

    // 检查super admin权限
    if (to.matched.some((record) => record.meta.requiresSuperAdmin)) {
      if (!userStore.isSuperAdmin) {
        next("/admin")
        return
      }
    }
    
    // 检查题目权限
    else if (to.matched.some((record) => record.meta.requiresProblemPermission)) {
      if (!userStore.hasProblemPermission) {
        next("/admin")
        return
      }
    }
    
    // 检查基本admin权限
    else if (to.matched.some((record) => record.meta.requiresAdmin)) {
      if (!userStore.isAdminRole) {
        next("/")
        return
      }
    }
  }

  next()
})

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  ArcElement,
  LineElement,
  LineController,
  PointElement,
  Colors,
  Title,
  Tooltip,
  Legend,
)

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

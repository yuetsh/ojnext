<script setup lang="ts">
import { Sunny, Moon } from "@element-plus/icons-vue"
import { logout } from "./api"
import { useUserStore } from "./store/user"
import { isDark, toggleDark } from "~/shared/composables/dark"
import { toggleLogin, toggleSignup } from "~/shared/composables/modal"
import type {
  MenuOption,
  DropdownOption,
  DropdownDividerOption,
} from "naive-ui"
import { RouterLink } from "vue-router"

const userStore = useUserStore()
const router = useRouter()

async function handleLogout() {
  await logout()
  userStore.clearMyProfile()
  router.replace("/")
}

function handleDropdown(key: string) {
  switch (key) {
    case "logout":
      handleLogout()
      break
  }
}

onMounted(userStore.getMyProfile)

const menus: MenuOption[] = [
  {
    label: () =>
      h(RouterLink, { to: "/learn#step-1" }, { default: () => "自学" }),
    key: "learn",
  },
  {
    label: () => h(RouterLink, { to: "/" }, { default: () => "题库" }),
    key: "problem",
  },
  {
    label: () => h(RouterLink, { to: "/contest" }, { default: () => "比赛" }),
    key: "contest",
  },
  {
    label: () => h(RouterLink, { to: "/status" }, { default: () => "提交" }),
    key: "status",
  },
  {
    label: () => h(RouterLink, { to: "/rank" }, { default: () => "排名" }),
    key: "rank",
  },
]

const options = computed<Array<DropdownOption | DropdownDividerOption>>(() => [
  { label: "我的主页", key: "home" },
  { label: "我的提交", key: "status" },
  { label: "我的设置", key: "setting" },
  { label: "后台管理", key: "admin", show: userStore.isAdminRole },
  { type: "divider" },
  { label: "退出", key: "logout" },
])
</script>

<template>
  <n-space align="center">
    <n-menu mode="horizontal" :options="menus" default-value="problem"></n-menu>
    <n-space>
      <n-button circle @click="toggleDark()">
        <template #icon>
          <n-icon v-if="isDark"><Sunny /></n-icon>
          <n-icon v-else><Moon /></n-icon>
        </template>
      </n-button>
      <div v-if="userStore.isFinished">
        <n-dropdown
          v-if="userStore.isAuthed"
          :options="options"
          @select="handleDropdown"
        >
          <n-button>{{ userStore.user.username }}</n-button>
        </n-dropdown>
        <n-space v-else>
          <n-button @click="toggleLogin(true)">登录</n-button>
          <n-button @click="toggleSignup(true)">注册</n-button>
        </n-space>
      </div>
    </n-space>
  </n-space>
</template>

<style scoped></style>

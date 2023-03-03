<script setup lang="ts">
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
import { isDesktop } from "~/shared/composables/breakpoints"
import { code } from "~/shared/composables/learn"

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const active = computed(() => {
  const path = route.path.split("/")[1] || "problem"
  return !["user", "setting"].includes(path) ? path : ""
})

async function handleLogout() {
  await logout()
  userStore.clearProfile()
  router.replace("/")
}

onMounted(userStore.getMyProfile)

const menus: MenuOption[] = [
  {
    label: () =>
      h(RouterLink, { to: "/learn/step-1" }, { default: () => "自学" }),
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
    label: () =>
      h(RouterLink, { to: "/submission" }, { default: () => "提交" }),
    key: "submission",
  },
  {
    label: () => h(RouterLink, { to: "/rank" }, { default: () => "排名" }),
    key: "rank",
  },
]

const options = computed<Array<DropdownOption | DropdownDividerOption>>(() => [
  {
    label: "我的主页",
    key: "home",
    props: {
      onClick: () => router.push("/user"),
    },
  },
  {
    label: "我的提交",
    key: "status",
    props: {
      onClick: () => router.push("/submission?myself=1"),
    },
  },
  {
    label: "我的设置",
    key: "setting",
    props: {
      onClick: () => router.push("/setting"),
    },
  },
  { label: "后台管理", key: "admin", show: userStore.isAdminRole },
  { type: "divider" },
  { label: "退出", key: "logout", props: { onClick: handleLogout } },
])

function run() {
  console.log(code.value)
}
</script>

<template>
  <n-space v-if="isDesktop" justify="space-between" align="center">
    <n-menu mode="horizontal" :options="menus" :value="active" />
    <n-space>
      <n-button v-if="$route.name === 'learn'" type="primary" @click="run">
        运行
      </n-button>
      <div v-if="userStore.isFinished">
        <n-dropdown
          v-if="userStore.isAuthed"
          :options="options"
          trigger="click"
        >
          <n-button>{{ userStore.user!.username }}</n-button>
        </n-dropdown>
        <n-space v-else>
          <n-button @click="toggleLogin(true)">登录</n-button>
          <n-button @click="toggleSignup(true)">注册</n-button>
        </n-space>
      </div>
      <n-button circle @click="toggleDark()">
        <template #icon>
          <n-icon v-if="isDark"><i-ep-sunny /></n-icon>
          <n-icon v-else> <i-ep-moon /></n-icon>
        </template>
      </n-button>
    </n-space>
  </n-space>
  <n-space v-else justify="end">
    <n-button v-if="$route.name === 'learn'" type="primary" @click="run">
      运行
    </n-button>
    <n-dropdown v-if="userStore.isAuthed" :options="options" trigger="click">
      <n-button>{{ userStore.user!.username }}</n-button>
    </n-dropdown>
    <n-space v-else>
      <n-button @click="toggleLogin(true)">登录</n-button>
      <n-button @click="toggleSignup(true)">注册</n-button>
    </n-space>
    <n-dropdown :options="menus" trigger="click">
      <n-button>
        <template #icon>
          <n-icon>
            <i-ep-menu />
          </n-icon>
        </template>
      </n-button>
    </n-dropdown>
    <n-button circle @click="toggleDark()">
      <template #icon>
        <n-icon v-if="isDark"><i-ep-sunny /></n-icon>
        <n-icon v-else> <i-ep-moon /></n-icon>
      </template>
    </n-button>
  </n-space>
</template>

<style scoped></style>

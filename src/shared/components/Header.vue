<script setup lang="ts">
import { logout } from "../api"
import { useUserStore } from "../store/user"
import { useConfigStore } from "../store/config"
import { isDark, toggleDark } from "~/shared/composables/dark"
import { toggleLogin, toggleSignup } from "~/shared/composables/modal"
import { RouterLink } from "vue-router"
import { isDesktop, isMobile } from "~/shared/composables/breakpoints"
import {
  screenSwitchLabel,
  switchScreenMode,
} from "~/shared/composables/switchScreen"
import { code } from "~/shared/composables/learn"
import { useLearnStore } from "~/learn/store"

const userStore = useUserStore()
const configStore = useConfigStore()
const learnStore = useLearnStore()
const route = useRoute()
const router = useRouter()
const active = computed(() => {
  const path = route.path.split("/")[1] || "problem"
  return !["user", "setting"].includes(path) ? path : ""
})
const hiddenTitle = computed(() => isMobile.value && route.name === "learn")

async function handleLogout() {
  await logout()
  userStore.clearProfile()
  router.replace("/")
}

onMounted(() => {
  userStore.getMyProfile()
  configStore.getConfig()
})

const menus = computed<MenuOption[]>(() => [
  {
    label: () =>
      h(RouterLink, { to: "/learn/step-1" }, { default: () => "自学" }),
    key: "learn",
    show: false,
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
  {
    label: () => h(RouterLink, { to: "/admin" }, { default: () => "后台" }),
    show: userStore.isAdminRole,
    key: "admin",
  },
])

const options: Array<DropdownOption | DropdownDividerOption> = [
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
  { type: "divider" },
  { label: "退出", key: "logout", props: { onClick: handleLogout } },
]

function run() {
  console.log(code.value)
}

function goHome() {
  router.push("/")
}

function switchScreen() {}
</script>

<template>
  <n-space justify="space-between" align="center">
    <n-space align="center">
      <div v-if="!hiddenTitle" class="websiteTitle" @click="goHome">
        {{ configStore.config?.website_name }}
      </div>
      <n-menu
        v-if="isDesktop"
        mode="horizontal"
        :options="menus"
        :value="active"
      />
    </n-space>
    <n-space align="center">
      <n-dropdown
        v-if="route.name === 'learn' && isMobile"
        trigger="click"
        :options="learnStore.menu"
      >
        <n-button>目录</n-button>
      </n-dropdown>
      <div v-if="route.name === 'learn'">
        <n-button v-if="isDesktop" type="primary" @click="run">
          运行代码
        </n-button>
        <n-button v-else circle @click="run">
          <n-icon>
            <i-ep-arrow-right-bold />
          </n-icon>
        </n-button>
      </div>
      <n-dropdown v-if="isMobile" :options="menus" trigger="click">
        <n-button>菜单</n-button>
      </n-dropdown>
      <n-button
        v-if="
          isDesktop &&
          (route.name === 'problem' || route.name === 'contest problem')
        "
        @click="switchScreenMode"
      >
        {{ screenSwitchLabel }}
      </n-button>
      <div v-if="userStore.isFinished">
        <n-dropdown
          v-if="userStore.isAuthed"
          :options="options"
          trigger="click"
        >
          <n-button>{{ userStore.user!.username }}</n-button>
        </n-dropdown>
        <n-space align="center" v-else>
          <n-button @click="toggleLogin(true)">登录</n-button>
          <n-button
            v-if="configStore.config?.allow_register"
            @click="toggleSignup(true)"
          >
            注册
          </n-button>
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
</template>

<style scoped>
.websiteTitle {
  font-size: 18px;
  margin-left: 8px;
  cursor: pointer;
}
</style>

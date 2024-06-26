<script setup lang="ts">
import { logout } from "../api"
import { useUserStore } from "../store/user"
import { useConfigStore } from "../store/config"
import { toggleLogin, toggleSignup } from "~/shared/composables/modal"
import { RouterLink } from "vue-router"
import { isDesktop, isMobile } from "~/shared/composables/breakpoints"
import {
  screenSwitchLabel,
  switchScreenMode,
} from "~/shared/composables/switchScreen"
import { Icon } from "@iconify/vue"

const isDark = useDark()
const toggleDark = useToggle(isDark)
const userStore = useUserStore()
const configStore = useConfigStore()
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

function renderIcon(icon: string) {
  return () => h(Icon, { icon, width: 24, height: 24 })
}

const avatars = [
  "openmoji:glowing-star",
  "openmoji:heart-with-ribbon",
  "openmoji:flag-china",
  "openmoji:fish-cake-with-swirl",
  "openmoji:astronaut",
  "openmoji:alien-monster",
  "openmoji:zany-face",
  "openmoji:eyes",
  "openmoji:desktop-computer",
  "openmoji:watermelon",
  "openmoji:cheese-wedge",
  "openmoji:wrapped-gift",
]

const avatar = ref(avatars[Math.floor(Math.random() * avatars.length)])

function getRandomAvatar() {
  avatar.value = avatars[Math.floor(Math.random() * avatars.length)]
}

onMounted(() => {
  userStore.getMyProfile()
  configStore.getConfig()
})

const menus = computed<MenuOption[]>(() => [
  {
    label: () => h(RouterLink, { to: "/" }, { default: () => "题库" }),
    key: "problem",
    icon: renderIcon("openmoji:jack-o-lantern"),
  },
  {
    label: () =>
      h(RouterLink, { to: "/submission" }, { default: () => "提交" }),
    key: "submission",
    icon: renderIcon("openmoji:clown-face"),
  },
  {
    label: () => h(RouterLink, { to: "/contest" }, { default: () => "比赛" }),
    key: "contest",
    icon: renderIcon("openmoji:face-with-tears-of-joy"),
  },
  {
    label: () => h(RouterLink, { to: "/rank" }, { default: () => "排名" }),
    key: "rank",
    icon: renderIcon("openmoji:sports-medal"),
  },
  {
    label: () =>
      h(RouterLink, { to: "/announcement" }, { default: () => "公告" }),
    key: "announcement",
    icon: renderIcon("openmoji:hamburger"),
  },
  {
    label: () => h(RouterLink, { to: "/admin" }, { default: () => "后台" }),
    show: userStore.isAdminRole,
    key: "admin",
    icon: renderIcon("openmoji:hacker-cat"),
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
    label: "我的消息",
    key: "message",
    props: {
      onClick: () => router.push("/message"),
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

function goHome() {
  router.push("/")
}
</script>

<template>
  <n-space justify="space-between" align="center">
    <n-space align="center">
      <div class="websiteTitle" @click="goHome">
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
      <n-dropdown v-if="isMobile" :options="menus">
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
        <n-dropdown v-if="userStore.isAuthed" :options="options">
          <n-button @click="getRandomAvatar">
            <template #icon>
              <Icon :icon="avatar"></Icon>
            </template>
            {{ userStore.user!.username }}
          </n-button>
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
          <Icon v-if="isDark" icon="ph:sun"></Icon>
          <Icon v-else icon="ph:moon"></Icon>
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

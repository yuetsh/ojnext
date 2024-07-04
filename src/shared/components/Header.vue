<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { RouterLink } from "vue-router"
import { isDesktop, isMobile } from "~/shared/composables/breakpoints"
import { toggleLogin, toggleSignup } from "~/shared/composables/modal"
import {
  screenSwitchLabel,
  switchScreenMode,
} from "~/shared/composables/switchScreen"
import { logout } from "../api"
import { useConfigStore } from "../store/config"
import { useUserStore } from "../store/user"

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
  "streamline-emojis:man-with-chinese-cap-1",
  "streamline-emojis:cat-face",
  "streamline-emojis:china",
  "streamline-emojis:chicken",
  "streamline-emojis:eyes",
  "streamline-emojis:elephant",
  "streamline-emojis:hear-no-evil-monkey",
  "streamline-emojis:panda-face",
  "streamline-emojis:penguin-1",
  "streamline-emojis:rooster",
  "streamline-emojis:star-struck-1",
  "streamline-emojis:tomato",
  "streamline-emojis:rocket",
  "streamline-emojis:sparkles",
  "streamline-emojis:money-bag",
  "streamline-emojis:ghost",
  "streamline-emojis:game-dice",
  "streamline-emojis:ewe-1",
  "streamline-emojis:artist-palette",
  "streamline-emojis:baby-bottle",
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
    icon: renderIcon("streamline-emojis:jack-o-lantern"),
  },
  {
    label: () =>
      h(RouterLink, { to: "/submission" }, { default: () => "提交" }),
    key: "submission",
    icon: renderIcon("streamline-emojis:lemon"),
  },
  {
    label: () => h(RouterLink, { to: "/contest" }, { default: () => "比赛" }),
    key: "contest",
    icon: renderIcon("streamline-emojis:direct-hit"),
  },
  {
    label: () => h(RouterLink, { to: "/rank" }, { default: () => "排名" }),
    key: "rank",
    icon: renderIcon("streamline-emojis:crown"),
  },
  {
    label: () =>
      h(RouterLink, { to: "/announcement" }, { default: () => "公告" }),
    key: "announcement",
    icon: renderIcon("streamline-emojis:police-car-light"),
  },
  {
    label: () => h(RouterLink, { to: "/admin" }, { default: () => "后台" }),
    show: userStore.isAdminRole,
    key: "admin",
    icon: renderIcon("streamline-emojis:unicorn-face"),
  },
])

const options: Array<DropdownOption | DropdownDividerOption> = [
  {
    label: "我的主页",
    key: "home",
    icon: renderIcon("streamline-emojis:newspaper"),
    props: {
      onClick: () => router.push("/user"),
    },
  },
  {
    label: "我的消息",
    key: "message",
    icon: renderIcon("streamline-emojis:herb"),
    props: {
      onClick: () => router.push("/message"),
    },
  },
  {
    label: "我的提交",
    key: "status",
    icon: renderIcon("streamline-emojis:bar-chart"),
    props: {
      onClick: () => router.push("/submission?myself=1"),
    },
  },
  {
    label: "我的设置",
    key: "setting",
    icon: renderIcon("streamline-emojis:robot-face-1"),
    props: {
      onClick: () => router.push("/setting"),
    },
  },
  { type: "divider" },
  {
    label: "退出",
    key: "logout",
    icon: renderIcon("streamline-emojis:hot-beverage-2"),
    props: { onClick: handleLogout },
  },
]

function goHome() {
  router.push("/")
}
</script>

<template>
  <n-space justify="space-between" align="center">
    <n-space align="center">
      <n-flex align="center" class="title" @click="goHome">
        <Icon icon="streamline-emojis:dog" :width="30" :height="30"></Icon>
        <div v-if="isDesktop">{{ configStore.config?.website_name }}</div>
      </n-flex>
      <n-menu
        v-if="isDesktop"
        mode="horizontal"
        :options="menus"
        :value="active"
      />
    </n-space>
    <n-space align="center">
      <n-dropdown v-if="isMobile" :options="menus" size="large">
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
        <n-dropdown v-if="userStore.isAuthed" :options="options" size="large">
          <n-button @click="getRandomAvatar">
            <Icon :icon="avatar" :height="20" :width="20"></Icon>
            <span style="padding-left: 8px">
              {{ userStore.user!.username }}
            </span>
          </n-button>
        </n-dropdown>
        <n-flex align="center" v-else>
          <n-button @click="toggleLogin(true)">登录</n-button>
          <n-button
            v-if="configStore.config?.allow_register"
            @click="toggleSignup(true)"
          >
            注册
          </n-button>
        </n-flex>
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
.title {
  font-size: 18px;
  cursor: pointer;
}
</style>

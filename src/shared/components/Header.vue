<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { RouterLink } from "vue-router"
import { useBreakpoints } from "shared/composables/breakpoints"
import { useAuthModalStore } from "shared/store/authModal"
import { useScreenModeStore } from "shared/store/screenMode"
import { logout } from "../api"
import { useConfigStore } from "../store/config"
import { useUserStore } from "../store/user"

const userStore = useUserStore()
const configStore = useConfigStore()
const authStore = useAuthModalStore()
const screenModeStore = useScreenModeStore()
const route = useRoute()
const router = useRouter()

const { isMobile, isDesktop } = useBreakpoints()

const isDark = useDark()

// 从 store 中获取屏幕模式状态
const { screenMode } = storeToRefs(screenModeStore)

const names = [
  "man-with-chinese-cap-1",
  "cat-face",
  "china",
  "chicken",
  "eyes",
  "elephant",
  "hear-no-evil-monkey",
  "panda-face",
  "penguin-1",
  "rooster",
  "star-struck-1",
  "tomato",
  "rocket",
  "sparkles",
  "money-bag",
  "ghost",
  "game-dice",
  "ewe-1",
  "artist-palette",
  "baby-bottle",
]

function getRandomAvatar() {
  const name = names[Math.floor(Math.random() * names.length)]
  return `streamline-emojis:${name}`
}

const avatar = ref(getRandomAvatar())

const envVersion = computed(() => {
  if (import.meta.env.PUBLIC_ENV === "test") {
    return "测试版"
  } else if (import.meta.env.PUBLIC_ENV === "dev") {
    return "开发版"
  }
  return ""
})

const showEnvVersion = computed(() => {
  return (
    import.meta.env.PUBLIC_ENV === "test" ||
    import.meta.env.PUBLIC_ENV === "dev"
  )
})

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

const menus = computed<MenuOption[]>(() => [
  {
    label: () => h(RouterLink, { to: "/learn/01" }, { default: () => "自学" }),
    key: "learn",
    icon: renderIcon("streamline-emojis:snake"),
  },
  {
    label: () => h(RouterLink, { to: "/" }, { default: () => "题目" }),
    key: "problem",
    icon: renderIcon("streamline-emojis:blossom"),
  },
  {
    label: () =>
      h(RouterLink, { to: "/problemset" }, { default: () => "题单" }),
    key: "problemset",
    icon: renderIcon("streamline-emojis:green-book"),
  },
  {
    label: () =>
      h(RouterLink, { to: "/submission" }, { default: () => "提交" }),
    key: "submission",
    icon: renderIcon("streamline-emojis:bouquet"),
    show: userStore.showSubmissions,
  },
  {
    label: () => h(RouterLink, { to: "/contest" }, { default: () => "比赛" }),
    key: "contest",
    icon: renderIcon("streamline-emojis:cherries"),
  },
  {
    label: () => h(RouterLink, { to: "/rank" }, { default: () => "排名" }),
    key: "rank",
    icon: renderIcon("streamline-emojis:hibiscus"),
  },
  {
    label: () =>
      h(RouterLink, { to: "/announcement" }, { default: () => "公告" }),
    key: "announcement",
    icon: renderIcon("streamline-emojis:palm-tree"),
  },
  {
    label: () =>
      h(
        RouterLink,
        { to: userStore.isTheAdmin ? "/admin/problem/list" : "/admin" },
        { default: () => "后台" },
      ),
    show: userStore.isAdminRole,
    key: "admin",
    icon: renderIcon("streamline-emojis:ghost"),
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
    show: false,
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
    icon: renderIcon("streamline-emojis:musical-score"),
    props: {
      onClick: () => router.push("/setting"),
    },
  },
  {
    label: "智能分析",
    key: "ai-analysis",
    icon: renderIcon("vscode-icons:file-type-gemini"),
    props: {
      onClick: () => router.push("/ai-analysis"),
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
  <n-flex justify="space-between" align="center">
    <n-flex align="center">
      <n-flex align="center" class="title" @click="goHome">
        <Icon icon="streamline-emojis:dog" :height="30"></Icon>
        <div>{{ configStore.config?.website_name }}</div>
        <div v-if="showEnvVersion">({{ envVersion }})</div>
      </n-flex>
      <div>
        <n-menu
          v-if="isDesktop"
          mode="horizontal"
          :options="menus"
          :value="active"
        />
      </div>
    </n-flex>
    <n-flex align="center">
      <n-dropdown v-if="isMobile" :options="menus" size="large">
        <n-button>
          <Icon icon="twemoji:artist-palette" height="20"></Icon>
          <span style="padding-left: 8px">菜单</span>
        </n-button>
      </n-dropdown>
      <n-button
        v-if="
          isDesktop &&
          (route.name === 'problem' || route.name === 'contest problem')
        "
        @click="() => screenModeStore.switchScreenMode()"
      >
        {{ screenMode }}
      </n-button>
      <div v-if="userStore.isFinished">
        <n-dropdown v-if="userStore.isAuthed" :options="options" size="large">
          <n-button>
            <Icon :icon="avatar" height="20"></Icon>
            <span style="padding-left: 8px">
              {{ userStore.user!.username }}
            </span>
          </n-button>
        </n-dropdown>
        <n-flex align="center" v-else>
          <n-button
            secondary
            type="primary"
            @click="authStore.openLoginModal()"
          >
            登录
          </n-button>
          <n-button
            tertiary
            v-if="configStore.config?.allow_register"
            @click="authStore.openSignupModal()"
          >
            注册
          </n-button>
        </n-flex>
      </div>
      <n-button :bordered="false" circle @click="isDark = !isDark">
        <template #icon>
          <Icon v-if="isDark" icon="twemoji:sun-behind-small-cloud"></Icon>
          <Icon v-else icon="twemoji:cloud-with-lightning-and-rain"></Icon>
        </template>
      </n-button>
    </n-flex>
  </n-flex>
</template>

<style scoped>
.title {
  font-size: 18px;
  cursor: pointer;
}
</style>

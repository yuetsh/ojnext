<script setup lang="ts">
import { h } from "vue"
import { RouterLink } from "vue-router"
import { STORAGE_KEY } from "utils/constants"
import storage from "utils/storage"
import { useUserStore } from "../store/user"
import type { MenuOption } from "naive-ui"

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 根据用户权限动态生成菜单选项
const options = computed<MenuOption[]>(() => {
  const baseOptions: MenuOption[] = [
    {
      label: () => h(RouterLink, { to: "/" }, { default: () => "前台" }),
      key: "return to OJ",
    },
  ]

  // admin 可以访问的功能
  if (userStore.isTheAdmin) {
    baseOptions.push({
      label: () =>
        h(RouterLink, { to: "/admin/problem/list" }, { default: () => "题目" }),
      key: "admin problem list",
    })
  }

  // super_admin 可以访问的功能
  if (userStore.isSuperAdmin) {
    baseOptions.push(
      {
        label: () => h(RouterLink, { to: "/admin" }, { default: () => "管理" }),
        key: "admin home",
      },
      {
        label: () =>
          h(RouterLink, { to: "/admin/config" }, { default: () => "设置" }),
        key: "admin config",
      },
      {
        label: () =>
          h(
            RouterLink,
            { to: "/admin/problem/list" },
            { default: () => "题目" },
          ),
        key: "admin problem list",
      },
      {
        label: () =>
          h(
            RouterLink,
            { to: "/admin/contest/list" },
            { default: () => "比赛" },
          ),
        key: "admin contest list",
      },
      {
        label: () =>
          h(
            RouterLink,
            { to: "/admin/problemset/list" },
            { default: () => "题单" },
          ),
        key: "admin problemset list",
      },
      {
        label: () =>
          h(RouterLink, { to: "/admin/user/list" }, { default: () => "用户" }),
        key: "admin user list",
      },
      {
        label: () =>
          h(
            RouterLink,
            { to: "/admin/comment/list" },
            { default: () => "评论" },
          ),
        key: "admin comment list",
      },
      {
        label: () =>
          h(
            RouterLink,
            { to: "/admin/announcement/list" },
            { default: () => "公告" },
          ),
        key: "admin announcement list",
      },
      {
        label: () =>
          h(
            RouterLink,
            { to: "/admin/tutorial/list" },
            { default: () => "教程" },
          ),
        key: "admin tutorial list",
      },
    )
  }

  return baseOptions
})

// 根据路径计算当前激活的菜单项
const active = computed(() => {
  const path = route.path
  if (path === "/") return "return to OJ"
  if (path === "/admin") return "admin home"
  if (path.startsWith("/admin/config")) return "admin config"
  if (path.startsWith("/admin/problem")) return "admin problem list"
  if (path.startsWith("/admin/contest")) return "admin contest list"
  if (path.startsWith("/admin/user")) return "admin user list"
  if (path.startsWith("/admin/comment")) return "admin comment list"
  if (path.startsWith("/admin/announcement")) return "admin announcement list"
  if (path.startsWith("/admin/tutorial")) return "admin tutorial list"
  return route.name as string
})

onMounted(async () => {
  if (!storage.get(STORAGE_KEY.AUTHED)) {
    router.replace("/")
  } else {
    await userStore.getMyProfile()
    if (!userStore.isAdminRole) {
      router.replace("/")
    }
  }
})
</script>

<template>
  <n-layout has-sider position="absolute">
    <!-- 侧边栏 -->
    <n-layout-sider bordered :width="100" :native-scrollbar="false">
      <!-- 菜单 -->
      <n-menu :options="options" :value="active" />
    </n-layout-sider>

    <!-- 主内容区域 -->
    <n-layout>
      <n-layout-content content-style="padding: 20px">
        <router-view></router-view>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router"
import { STORAGE_KEY } from "~/utils/constants"
import storage from "~/utils/storage"
import { useUserStore } from "../store/user"

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

const active = computed(() => (route.name as string) || "home")

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
    <n-layout-sider width="100" bordered :native-scrollbar="false">
      <n-menu :options="options" :value="active" />
    </n-layout-sider>
    <n-layout-content content-style="padding: 16px; min-width: 600px">
      <router-view></router-view>
    </n-layout-content>
  </n-layout>
</template>

<style scoped></style>

<script setup lang="ts">
import { MenuOption } from "naive-ui"
import { RouterLink } from "vue-router"

const route = useRoute()
const options: MenuOption[] = [
  {
    label: () => h(RouterLink, { to: "/" }, { default: () => "返回 OJ" }),
    key: "return to OJ",
  },
  {
    label: () => h(RouterLink, { to: "/admin" }, { default: () => "首页" }),
    key: "admin home",
  },
  {
    label: "题目",
    key: "problem",
    disabled: true,
  },
  {
    label: () =>
      h(
        RouterLink,
        { to: "/admin/problem/list" },
        { default: () => "题目列表" }
      ),
    key: "admin problem list",
  },
  {
    label: () =>
      h(
        RouterLink,
        { to: "/admin/problem/create" },
        { default: () => "创建题目" }
      ),
    key: "admin problem create",
  },
  { label: "用户", key: "user", disabled: true },
  {
    label: () =>
      h(RouterLink, { to: "/admin/user/list" }, { default: () => "用户列表" }),
    key: "admin user list",
  },
  {
    label: () =>
      h(
        RouterLink,
        { to: "/admin/user/importing" },
        { default: () => "导入用户" }
      ),
    key: "admin user importing",
  },
  { label: "比赛", key: "contest", disabled: true },
  {
    label: () =>
      h(
        RouterLink,
        { to: "/admin/contest/list" },
        { default: () => "比赛列表" }
      ),
    key: "admin contest list",
  },
  {
    label: () =>
      h(
        RouterLink,
        { to: "/admin/contest/create" },
        { default: () => "创建比赛" }
      ),
    key: "admin contest create",
  },
  { label: "其他", key: "other", disabled: true },
  {
    label: () =>
      h(RouterLink, { to: "/admin/config" }, { default: () => "系统配置" }),
    key: "admin config",
  },
  {
    label: () =>
      h(
        RouterLink,
        { to: "/admin/announcement" },
        { default: () => "公告配置" }
      ),
    key: "admin announcement",
  },
]

const active = computed(() => (route.name as string) || "home")
</script>

<template>
  <n-layout has-sider position="absolute">
    <n-layout-sider width="160" bordered :native-scrollbar="false">
      <n-menu :options="options" :value="active" />
    </n-layout-sider>
    <n-layout-content content-style="padding: 16px">
      <router-view></router-view>
    </n-layout-content>
  </n-layout>
</template>

<style scoped></style>

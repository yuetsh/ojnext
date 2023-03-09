<script setup lang="ts">
import { MenuOption } from "naive-ui"
import Login from "../Login.vue"
import Signup from "../Signup.vue"

const options: MenuOption[] = [
  { label: "题目", key: "problem", disabled: true },
  { label: "题目列表", key: "problem list" },
  { label: "创建题目", key: "create problem" },
  { label: "用户", key: "user", disabled: true },
  { label: "用户列表", key: "user list" },
  { label: "导入用户", key: "user import" },
  { label: "比赛", key: "contest", disabled: true },
  { label: "比赛列表", key: "contest list" },
  { label: "创建比赛", key: "create contest" },
  { label: "其他", key: "other", disabled: true },
  { label: "系统配置", key: "config" },
  { label: "公告配置", key: "announcement" },
]
</script>

<template>
  <n-layout has-sider position="absolute">
    <n-layout-sider bordered :native-scrollbar="false">
      <n-menu :options="options" />
    </n-layout-sider>
    <n-layout-content :native-scrollbar="false">
      <router-view></router-view>
    </n-layout-content>
    <Login />
    <Signup />
  </n-layout>
</template>

<style scoped>
.content {
  padding: 16px;
}
</style>

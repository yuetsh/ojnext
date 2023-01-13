<script setup lang="ts">
import { Sunny, Moon } from "@element-plus/icons-vue"
import { logout } from "../api"
import { useUserStore } from "../store/user"
import { isDark, toggleDark } from "~/shared/composables/dark"
import { toggleLogin, toggleSignup } from "~/shared/composables/modal"

const userStore = useUserStore()
const router = useRouter()

async function handleLogout() {
  await logout()
  userStore.clearMyProfile()
  router.replace("/")
}

function handleDropdown(command: string) {
  switch (command) {
    case "logout":
      handleLogout()
      break
  }
}

onMounted(userStore.getMyProfile)
</script>

<template>
  <el-menu router mode="horizontal" :default-active="$route.path">
    <el-menu-item index="/learn">自学</el-menu-item>
    <el-menu-item index="/">题库</el-menu-item>
    <el-menu-item index="/contest">比赛</el-menu-item>
    <el-menu-item index="/status">提交</el-menu-item>
    <el-menu-item index="/rank">排名</el-menu-item>
  </el-menu>
  <el-space class="actions">
    <el-button
      circle
      :icon="isDark ? Sunny : Moon"
      @click="toggleDark()"
    ></el-button>
    <div v-if="userStore.isFinished && !userStore.isAuthed">
      <el-button @click="toggleLogin(true)">登录</el-button>
      <el-button @click="toggleSignup(true)">注册</el-button>
    </div>
    <div v-if="userStore.isFinished && userStore.isAuthed">
      <el-dropdown @command="handleDropdown">
        <el-button>{{ userStore.user.username }}</el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>我的主页</el-dropdown-item>
            <el-dropdown-item>我的提交</el-dropdown-item>
            <el-dropdown-item>我的设置</el-dropdown-item>
            <el-dropdown-item v-if="userStore.isAdminRole">
              后台管理
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">退出</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-space>
</template>

<style scoped>
.el-menu {
  flex: 1;
}
.actions {
  display: flex;
  align-items: center;
  border-bottom: solid 1px var(--el-menu-border-color);
}
</style>

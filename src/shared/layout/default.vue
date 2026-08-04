<script setup lang="ts">
import Beian from "../components/Beian.vue"
import Header from "../components/Header.vue"
import Login from "../components/Login.vue"
import Signup from "../components/Signup.vue"
import LoginSummaryModal from "../components/LoginSummaryModal.vue"
import AchievementToast from "../components/AchievementToast.vue"
import { useAchievementStore } from "shared/store/achievement"
import { useUserStore } from "shared/store/user"

const achievementStore = useAchievementStore()
const userStore = useUserStore()
const route = useRoute()

// 拉取才是主通道：WebSocket 不是常驻连接（只在问题页且有提交监听时建连），
// 所以任何页面、任何时刻解锁的成就都靠这里补上
watch(
  () => route.path,
  () => {
    if (userStore.isAuthed) achievementStore.fetchPending()
  },
  { immediate: true },
)
</script>

<template>
  <n-layout position="absolute">
    <n-layout-header bordered style="padding: 8px">
      <Header class="header" />
    </n-layout-header>
    <n-layout-content
      content-style="padding: 16px; overflow-x: initial; max-width: 2000px; margin: 0 auto;"
    >
      <router-view></router-view>
    </n-layout-content>
    <Login />
    <Signup />
    <LoginSummaryModal />
    <AchievementToast />
    <Beian />
  </n-layout>
</template>

<style scoped>
.header {
  max-width: 2000px;
  margin-left: auto;
  margin-right: auto;
}
</style>

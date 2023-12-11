<script setup lang="ts">
import Login from "../components/Login.vue"
import Signup from "../components/Signup.vue"
import Header from "../components/Header.vue"

function goICP() {
  window.open("https://beian.miit.gov.cn", "_balnk")
}

function goPublicSecurity() {
  window.open(
    "https://beian.mps.gov.cn/#/query/webSearch?code=33100402331786",
    "_balnk",
  )
}

const route = useRoute()
const hiddenICP = computed(() =>
  ["problem", "contest problem"].includes(<string>route.name),
)
</script>

<template>
  <n-layout position="absolute">
    <n-layout-header bordered class="header">
      <Header />
    </n-layout-header>
    <n-layout-content content-style="padding: 16px; overflow-x: initial">
      <router-view></router-view>
    </n-layout-content>
    <Login />
    <Signup />
    <n-space v-if="!hiddenICP" justify="center" class="beian">
      <n-button text @click="goICP">浙ICP备2023044109号</n-button>
      <div>
        <img class="psIcon" src="/备案图标.png" alt="备案图标" />
        <n-button text @click="goPublicSecurity">
          浙公网安备33100402331786
        </n-button>
      </div>
    </n-space>
  </n-layout>
</template>

<style scoped>
.header {
  padding: 8px;
}

.beian {
  margin-bottom: 12px;
}

.beian > a {
  text-decoration: none;
}

.psIcon {
  width: 14px;
  height: 14px;
  transform: translateY(2px);
  margin-right: 2px;
}
</style>

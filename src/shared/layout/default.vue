<script setup lang="ts">
import Login from "../components/Login.vue"
import Signup from "../components/Signup.vue"
import Header from "../components/Header.vue"
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
    <n-space justify="center" class="beian">
      <n-a href="https://beian.miit.gov.cn" target="_blank">
        浙ICP备2023044109号
      </n-a>
    </n-space>
  </n-layout>
</template>

<style scoped>
.header {
  padding: 8px;
}

.beian {
  margin-bottom: 20px;
}
</style>

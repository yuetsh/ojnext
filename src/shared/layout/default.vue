<script setup lang="ts">
import Login from "../Login.vue"
import Signup from "../Signup.vue"
import Header from "../Header.vue"
import { useConfigStore } from "../store/config"

const configStore = useConfigStore()
</script>

<template>
  <n-layout position="absolute">
    <n-layout-header bordered class="header">
      <Header />
    </n-layout-header>
    <n-layout-content content-style="padding: 16px; overflow-x: initial">
      <router-view></router-view>
    </n-layout-content>
    <p class="footer">{{ configStore.config?.website_footer }}</p>
    <Login />
    <Signup />
  </n-layout>
</template>

<style scoped>
.header {
  padding: 8px;
}
.footer {
  text-align: center;
  margin: 20px 0;
}
</style>

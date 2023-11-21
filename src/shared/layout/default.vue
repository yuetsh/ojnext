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
  </n-layout>
</template>

<style scoped>
.header {
  padding: 8px;
}
</style>

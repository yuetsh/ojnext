<script setup lang="ts">
import Beian from "../components/Beian.vue"
import Header from "../components/Header.vue"
import Login from "../components/Login.vue"
import Signup from "../components/Signup.vue"
</script>

<template>
  <n-layout position="absolute">
    <n-layout-header bordered style="padding: 8px;">
      <Header />
    </n-layout-header>
    <n-layout-content
      content-style="padding: 16px; overflow-x: initial;"
    >
      <router-view></router-view>
    </n-layout-content>
    <Login />
    <Signup />
    <Beian />
  </n-layout>
</template>

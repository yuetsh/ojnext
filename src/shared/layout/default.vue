<script setup lang="ts">
import Login from "../Login.vue"
import Signup from "../Signup.vue"
import Header from "../Header.vue"
</script>

<template>
  <n-layout position="absolute" :native-scrollbar="false">
    <n-layout-header bordered class="header">
      <Header />
    </n-layout-header>
    <n-layout-content class="content">
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
.content {
  padding: 16px;
}
</style>

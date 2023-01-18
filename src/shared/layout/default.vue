<script setup lang="ts">
import Login from "../Login/index.vue"
import Signup from "../Signup/index.vue"
import Header from "../Header/index.vue"
</script>

<template>
  <n-layout>
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

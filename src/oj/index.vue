<script setup lang="ts">
import Login from "../shared/user/login.vue"
import Signup from "../shared/user/signup.vue"
import Header from "../shared/layout/header.vue"
</script>

<template>
  <el-container>
    <el-header class="header">
      <Header />
    </el-header>
    <el-main>
      <router-view></router-view>
    </el-main>
    <Login />
    <Signup />
  </el-container>
</template>

<style scoped>
.header {
  display: flex;
}
</style>

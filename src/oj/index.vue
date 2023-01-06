<script setup lang="ts">
import Login from "../shared/user/login.vue"
import Signup from "./components/signup.vue"
import Header from "./components/header.vue"
</script>

<template>
  <el-container>
    <el-header>
      <Header />
    </el-header>
    <el-main><router-view></router-view></el-main>
    <Login />
    <Signup />
  </el-container>
</template>

<style scoped>
.el-header {
  display: flex;
}
</style>

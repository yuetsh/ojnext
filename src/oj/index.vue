<script setup lang="ts">
import Login from "../shared/Login/index.vue"
import Signup from "../shared/Signup/index.vue"
import Header from "../shared/Header/index.vue"
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

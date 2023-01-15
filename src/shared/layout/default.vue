<script setup lang="ts">
import Login from "../Login/index.vue"
import Signup from "../Signup/index.vue"
import Header from "../Header/index.vue"
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

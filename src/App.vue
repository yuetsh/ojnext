<script setup lang="ts">
import zhCn from "element-plus/dist/locale/zh-cn.mjs"

const locale = zhCn
</script>

<template>
  <el-config-provider :locale="locale">
    <router-view></router-view>
  </el-config-provider>
</template>

<style scoped></style>

<script setup lang="ts">
import { zhCN, dateZhCN, darkTheme } from "naive-ui"
import { isDark } from "./shared/composables/dark"

const theme = computed(() => (isDark.value ? darkTheme : null))
</script>

<template>
  <n-config-provider :theme="theme" :locale="zhCN" :date-locale="dateZhCN">
    <router-view></router-view>
  </n-config-provider>
</template>

<style scoped></style>

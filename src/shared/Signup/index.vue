<script setup lang="ts">
import { useSignupStore } from "../../oj/store/signup"
const store = useSignupStore()
</script>

<template>
  <el-dialog
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    v-model="store.visible"
    title="注册"
  >
  </el-dialog>
</template>

<style scoped></style>

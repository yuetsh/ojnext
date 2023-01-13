<script setup lang="ts">
import { signupModal } from "../composables/modal"
</script>

<template>
  <el-dialog
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    v-model="signupModal"
    title="注册"
  >
  </el-dialog>
</template>

<style scoped></style>

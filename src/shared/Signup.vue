<script setup lang="ts">
import type { FormRules } from "naive-ui"
import { signupModal, toggleLogin, toggleSignup } from "./composables/modal"

const form = reactive({
  username: "",
  password: "",
  passwordAgain: "",
  email: "",
})
const rules: FormRules = {}

const [isLoading] = useToggle()
const msg = ref("")

function goLogin() {
  toggleLogin(true)
  toggleSignup(false)
}

function submit() {}
</script>

<template>
  <n-modal
    :mask-closable="false"
    v-model:show="signupModal"
    preset="card"
    title="注册"
    style="width: 400px"
    :auto-focus="false"
  >
    <n-form ref="signupRef" :model="form" :rules="rules" show-require-mark>
      <n-form-item label="用户名" path="username">
        <n-input
          v-model:value="form.username"
          autofocus
          clearable
          name="signup username"
        />
      </n-form-item>
      <n-form-item label="邮箱" path="email">
        <n-input
          v-model:value="form.email"
          clearable
          name="signup email"
          @change="submit"
        />
      </n-form-item>
      <n-form-item label="密码" path="password">
        <n-input
          v-model:value="form.password"
          clearable
          type="password"
          name="signup password"
        />
      </n-form-item>
      <n-form-item label="确认密码" path="password">
        <n-input
          v-model:value="form.passwordAgain"
          clearable
          type="password"
          name="signup password again"
        />
      </n-form-item>
      <n-alert v-if="msg" type="error" :show-icon="false"> {{ msg }}</n-alert>
      <n-form-item>
        <n-space>
          <n-button type="primary" :loading="isLoading" @click="submit">
            登录
          </n-button>
          <n-button @click="goLogin">已经注册？现在登录</n-button>
        </n-space>
      </n-form-item>
    </n-form>
  </n-modal>
</template>

<style scoped></style>

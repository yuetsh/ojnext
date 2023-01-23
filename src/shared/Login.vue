<script setup lang="ts">
import { login } from "./api"
import { loginModal, toggleLogin, toggleSignup } from "./composables/modal"
import { useUserStore } from "./store/user"
import type { FormRules } from "naive-ui"

const userStore = useUserStore()
const loginRef = ref()
const [isLoading] = useToggle()
const error = ref()
const form = reactive({
  username: "",
  password: "",
})
const rules: FormRules = {
  username: [{ required: true, message: "用户名必填", trigger: "blur" }],
  password: [
    { required: true, message: "密码必填", trigger: "blur" },
    { min: 6, max: 20, message: "长度在6到20位之间", trigger: "input" },
  ],
}

const msg = computed(() => error.value && "用户名或密码不正确")

async function submit() {
  loginRef.value?.validate(async (errors: FormRules | undefined) => {
    if (!errors) {
      try {
        error.value = null
        isLoading.value = true
        await login(form)
      } catch (err) {
        error.value = err
      } finally {
        isLoading.value = false
      }
      if (!error.value) {
        toggleLogin(false)
        userStore.getMyProfile()
      }
    }
  })
}

function goSignup() {
  toggleLogin(false)
  toggleSignup(true)
}
</script>

<template>
  <n-modal
    :mask-closable="false"
    v-model:show="loginModal"
    preset="card"
    title="登录"
    style="width: 400px"
    :auto-focus="false"
  >
    <n-form ref="loginRef" :model="form" :rules="rules" show-require-mark>
      <n-form-item label="用户名" path="username">
        <n-input
          v-model:value="form.username"
          autofocus
          clearable
          name="username"
        />
      </n-form-item>
      <n-form-item label="密码" path="password">
        <n-input
          v-model:value="form.password"
          clearable
          type="password"
          name="password"
          @change="submit"
        />
      </n-form-item>
      <n-alert v-if="msg" type="error" :show-icon="false"> {{ msg }}</n-alert>
      <n-form-item>
        <n-space>
          <n-button type="primary" :loading="isLoading" @click="submit">
            登录
          </n-button>
          <n-button @click="goSignup">没有账号，立即注册</n-button>
        </n-space>
      </n-form-item>
    </n-form>
  </n-modal>
</template>

<style scoped></style>

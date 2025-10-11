<script setup lang="ts">
import { getCaptcha, signup } from "../api"
import { storeToRefs } from "pinia"
import { useAuthModalStore } from "../store/authModal"

const authStore = useAuthModalStore()

const {
  signupModalOpen,
  signupForm: form,
  signupLoading: isLoading,
  signupError: msg,
  captchaSrc,
} = storeToRefs(authStore)
const signupRef = ref()

const rules: FormRules = {
  username: [{ required: true, message: "用户名必填", trigger: "blur" }],
  email: [{ required: true, message: "邮箱必填", trigger: "blur" }],
  password: [
    { required: true, message: "密码必填", trigger: "blur" },
    { min: 6, max: 20, message: "长度在 6 到 20 位之间", trigger: "input" },
  ],
  passwordAgain: [
    { required: true, message: "密码必填", trigger: "blur" },
    { min: 6, max: 20, message: "长度在 6 到 20 位之间", trigger: "input" },
    {
      validator: (_: FormItemRule, value: string) =>
        value === form.value.password,
      message: "两次密码输入不一致",
      trigger: "blur",
    },
  ],
  captcha: [
    { required: true, message: "验证码必填", trigger: "blur", min: 1, max: 10 },
  ],
}

function goLogin() {
  authStore.switchToLogin()
}

function submit() {
  signupRef.value!.validate(async (errors: FormRules | undefined) => {
    if (!errors) {
      try {
        authStore.clearSignupError()
        authStore.setSignupLoading(true)
        await signup({
          username: form.value.username,
          email: form.value.email,
          password: form.value.password,
          captcha: form.value.captcha,
        })
      } catch (err: any) {
        if (err.data === "Invalid captcha") {
          authStore.setSignupError("验证码不正确")
        } else if (err.data === "Username already exists") {
          authStore.setSignupError("用户名已存在")
        } else if (err.data === "Email already exists") {
          authStore.setSignupError("邮箱已存在")
        } else {
          authStore.setSignupError("无法注册")
        }
        getCaptchaSrc()
        form.value.captcha = ""
      } finally {
        authStore.setSignupLoading(false)
      }
      if (!msg.value) {
        authStore.closeSignupModal()
      }
    }
  })
}

async function getCaptchaSrc() {
  const res = await getCaptcha()
  authStore.setCaptchaSrc(res.data)
}

watch(signupModalOpen, (v) => {
  if (v) getCaptchaSrc()
})
</script>

<template>
  <n-modal
    :mask-closable="false"
    v-model:show="signupModalOpen"
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
          name="username"
          id="signup-username"
          autocomplete="username"
        />
      </n-form-item>
      <n-form-item label="邮箱" path="email">
        <n-input
          v-model:value="form.email"
          clearable
          name="email"
          id="signup-email"
          autocomplete="email"
          @change="submit"
        />
      </n-form-item>
      <n-form-item label="密码" path="password">
        <n-input
          v-model:value="form.password"
          clearable
          type="password"
          name="password"
          id="signup-password"  
          autocomplete="new-password"
        />
      </n-form-item>
      <n-form-item label="确认密码" path="passwordAgain">
        <n-input
          v-model:value="form.passwordAgain"
          clearable
          type="password"
          name="passwordAgain"
          id="signup-password-again"
          autocomplete="new-password"
        />
      </n-form-item>
      <n-form-item label="验证码" path="captcha">
        <n-space>
          <n-input
            v-model:value="form.captcha"
            clearable
            name="captcha"
            id="signup-captcha"
            autocomplete="off"
          />
          <img class="captcha" :src="captchaSrc" @click="getCaptchaSrc" />
        </n-space>
      </n-form-item>
      <n-alert v-if="msg" type="error" :show-icon="false"> {{ msg }}</n-alert>
      <n-form-item>
        <n-space>
          <n-button type="primary" :loading="isLoading" @click="submit">
            注册
          </n-button>
          <n-button @click="goLogin">已经注册？现在登录</n-button>
        </n-space>
      </n-form-item>
    </n-form>
  </n-modal>
</template>

<style scoped>
.captcha {
  height: 34px;
  cursor: pointer;
}
</style>

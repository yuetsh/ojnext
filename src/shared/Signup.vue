<script setup lang="ts">
import { getCaptcha, signup, login } from "./api"
import { signupModal, toggleLogin, toggleSignup } from "./composables/modal"
import { useUserStore } from "./store/user"

const userStore = useUserStore()
const signupRef = ref()
const captchaSrc = ref("")

const form = reactive({
  username: "",
  email: "",
  password: "",
  passwordAgain: "",
  captcha: "",
})

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
      validator: (_: FormItemRule, value: string) => value === form.password,
      message: "两次密码输入不一致",
      trigger: "blur",
    },
  ],
  captcha: [
    { required: true, message: "验证码必填", trigger: "blur", min: 1, max: 10 },
  ],
}

const [isLoading, toggleLoading] = useToggle()
const msg = ref("")

function goLogin() {
  toggleLogin(true)
  toggleSignup(false)
}

function submit() {
  signupRef.value!.validate(async (errors: FormRules | undefined) => {
    if (!errors) {
      try {
        msg.value = ""
        toggleLoading(true)
        await signup({
          username: form.username,
          email: form.email,
          password: form.password,
          captcha: form.captcha,
        })
      } catch (err: any) {
        if (err.data === "Invalid captcha") {
          msg.value = "验证码不正确"
        } else if (err.data === "Username already exists") {
          msg.value = "用户名已存在"
        } else if (err.data === "Email already exists") {
          msg.value = "邮箱已存在"
        } else {
          msg.value = "无法注册"
        }
        getCaptchaSrc()
        form.captcha = ""
      } finally {
        toggleLoading(false)
      }
      if (!msg.value) {
        toggleSignup(false)
        await login({ username: form.username, password: form.password })
        userStore.getMyProfile()
      }
    }
  })
}

async function getCaptchaSrc() {
  const res = await getCaptcha()
  captchaSrc.value = res.data
}

watch(signupModal, (v) => {
  if (v) getCaptchaSrc()
})
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
      <n-form-item label="确认密码" path="passwordAgain">
        <n-input
          v-model:value="form.passwordAgain"
          clearable
          type="password"
          name="signup password again"
        />
      </n-form-item>
      <n-form-item label="验证码" path="captcha">
        <n-space>
          <n-input
            v-model:value="form.captcha"
            clearable
            name="signup captcha"
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

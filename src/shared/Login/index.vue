<script setup lang="ts">
import { FormInstance } from "element-plus"
import { useSignupStore } from "~/shared/store/signup"
import { login } from "../api"
import { useLoginStore } from "../store/login"
import { useUserStore } from "../store/user"

const loginStore = useLoginStore()
const signupStore = useSignupStore()
const userStore = useUserStore()
const loginRef = ref<FormInstance>()
const form = reactive({
  username: "",
  password: "",
})
const rules = reactive({
  username: [{ required: true, message: "用户名必填", trigger: "blur" }],
  password: [
    { required: true, message: "密码必填", trigger: "blur" },
    { min: 6, max: 20, message: "长度在6到20位之间", trigger: "change" },
  ],
})
const { isLoading, error, execute } = login(form)
const msg = computed(() => error.value && "用户名或密码不正确")

async function submit() {
  if (!loginRef.value) return
  const valid = await loginRef.value.validate()
  if (valid) {
    await execute()
    if (!error.value) {
      loginStore.hide()
      userStore.getMyProfile()
    }
  }
}

function goSignup() {
  loginStore.hide()
  signupStore.show()
}
</script>

<template>
  <el-dialog
    style="max-width: 400px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    v-model="loginStore.visible"
    title="登录"
  >
    <el-form
      ref="loginRef"
      :model="form"
      :rules="rules"
      label-position="right"
      label-width="70px"
    >
      <el-form-item label="用户名" required prop="username">
        <el-input v-model="form.username" name="username"></el-input>
      </el-form-item>
      <el-form-item label="密码" required prop="password">
        <el-input
          v-model="form.password"
          type="password"
          show-password
          @change="submit"
          name="password"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="isLoading" @click="submit">
          登录
        </el-button>
        <el-button @click="goSignup">没有账号，立即注册</el-button>
      </el-form-item>
      <el-alert v-if="msg" :title="msg" show-icon type="error" />
    </el-form>
  </el-dialog>
</template>

<style scoped></style>

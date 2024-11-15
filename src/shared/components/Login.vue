<script setup lang="ts">
import { login } from "../api"
import { loginModal, toggleLogin, toggleSignup } from "../composables/modal"
import { useConfigStore } from "../store/config"
import { useUserStore } from "../store/user"

const userStore = useUserStore()
const configStore = useConfigStore()
const loginRef = ref()
const [isLoading, toggleLoading] = useToggle()
const msg = ref("")
const form = reactive({
  class: "",
  username: "",
  password: "",
})
const classList = computed<SelectOption[]>(() => {
  const defaults = [{ label: "不用填", value: "" }]
  const configs =
    configStore.config?.class_list.map((item) => ({
      label: `${item.slice(0, 2)}计算机${item.slice(2)}班`,
      value: `ks${item}`,
    })) ?? []
  return [...defaults, ...configs]
})
const rules: FormRules = {
  username: [{ required: true, message: "用户名必填", trigger: "blur" }],
  password: [
    { required: true, message: "密码必填", trigger: "blur" },
    { min: 6, max: 20, message: "长度在 6 到 20 位之间", trigger: "input" },
  ],
}

async function submit() {
  loginRef.value!.validate(async (errors: FormRules | undefined) => {
    if (!errors) {
      try {
        msg.value = ""
        toggleLoading(true)
        const merged = {
          username: form.username,
          password: form.password,
        }
        if (form.class) {
          merged.username = form.class + form.username
        }
        await login(merged)
      } catch (err: any) {
        if (err.data === "Your account has been disabled") {
          msg.value = "此账号已被封禁"
        } else if (err.data === "Invalid username or password") {
          msg.value = "用户名或密码不正确"
        } else {
          msg.value = "无法登录"
        }
      } finally {
        toggleLoading(false)
      }
      if (!msg.value) {
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
      <n-alert :show-icon="false" class="tip">
        关于【选择班级】的提醒：<br />
        1. 如果是上课统一生成的账号，选择【相应班级】，用户名直接写自己的名字
        <br />
        2.
        同样是上课用的号，但是没有你的班级。选择【不用填】，用户名要写：ks班级+姓名，比如23计算机1班张三，就写ks231张三
        <br />
        3. 如果是自己注册的号，选择【不用填】 <br />
      </n-alert>
      <n-form-item label="选择班级" path="class" :show-require-mark="false">
        <n-select
          v-model:value="form.class"
          :options="classList"
          clearable
          name="login class"
        />
      </n-form-item>
      <n-form-item label="用户名" path="username">
        <n-input
          v-model:value="form.username"
          autofocus
          clearable
          name="login username"
        />
      </n-form-item>
      <n-form-item label="密码" path="password">
        <n-input
          v-model:value="form.password"
          clearable
          type="password"
          name="login password"
          @change="submit"
        />
      </n-form-item>
      <n-alert v-if="msg" type="error" :show-icon="false"> {{ msg }}</n-alert>
      <n-form-item>
        <n-space>
          <n-button type="primary" :loading="isLoading" @click="submit">
            登录
          </n-button>
          <n-button v-if="configStore.config?.allow_register" @click="goSignup">
            没有账号？立即注册
          </n-button>
        </n-space>
      </n-form-item>
    </n-form>
  </n-modal>
</template>

<style scoped>
.tip {
  margin-bottom: 20px;
}
</style>

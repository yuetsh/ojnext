<script setup lang="ts">
import { getClassUsernames, login } from "../api"
import { storeToRefs } from "pinia"
import { useAuthModalStore } from "../store/authModal"
import { useConfigStore } from "../store/config"
import { useUserStore } from "../store/user"
import { useLoginSummaryStore } from "../store/loginSummary"

const userStore = useUserStore()
const configStore = useConfigStore()
const authStore = useAuthModalStore()
const loginSummaryStore = useLoginSummaryStore()

const {
  loginModalOpen,
  loginForm: form,
  loginLoading: isLoading,
  loginError: msg,
} = storeToRefs(authStore)
const loginRef = ref()
const classUserOptions = ref<SelectOption[]>([])
const classUserLoading = ref(false)
const isClassLogin = computed(() => Boolean(form.value.class))
const classList = computed<SelectOption[]>(() => {
  const defaults = [{ label: "没有我所在的班级", value: "" }]
  const configs =
    configStore.config?.class_list.map((item) => ({
      label: `${item.slice(0, 2)}计算机${item.slice(2)}班`,
      value: `ks${item}`,
    })) ?? []
  return [...defaults, ...configs]
})
const rules: FormRules = {
  username: [
    { required: true, message: "用户名必填", trigger: ["blur", "change"] },
  ],
  password: [
    { required: true, message: "密码必填", trigger: "blur" },
    { min: 6, max: 20, message: "长度在 6 到 20 位之间", trigger: "input" },
  ],
}

async function submit() {
  loginRef.value!.validate(async (errors: FormRules | undefined) => {
    if (!errors) {
      try {
        authStore.clearLoginError()
        authStore.setLoginLoading(true)
        const merged = {
          username: form.value.username,
          password: form.value.password,
        }
        if (form.value.class) {
          merged.username = form.value.class + form.value.username
        }
        await login(merged)
      } catch (err: any) {
        if (err.data === "Your account has been disabled") {
          authStore.setLoginError("此账号已被封禁")
        } else if (err.data === "Invalid username or password") {
          authStore.setLoginError("用户名或密码不正确")
        } else {
          authStore.setLoginError("无法登录")
        }
      } finally {
        authStore.setLoginLoading(false)
      }
      if (!msg.value) {
        authStore.closeLoginModal()
        await userStore.getMyProfile()
        loginSummaryStore.open()
      }
    }
  })
}

function goSignup() {
  authStore.switchToSignup()
}

async function loadClassUsernames(selectedClass: string) {
  classUserLoading.value = true
  try {
    const res = await getClassUsernames(selectedClass)
    classUserOptions.value = res.data.map((name: string) => ({
      label: name,
      value: name,
    }))
  } catch {
    classUserOptions.value = []
  } finally {
    classUserLoading.value = false
  }
}

watch(
  () => form.value.class,
  (selectedClass) => {
    classUserOptions.value = []
    form.value.username = ""
    if (!selectedClass) {
      classUserLoading.value = false
      return
    }
    loadClassUsernames(selectedClass.slice(2))
  },
)

onMounted(() => {
  authStore.clearLoginError()
})
</script>

<template>
  <n-modal
    :mask-closable="false"
    v-model:show="loginModalOpen"
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
        同样是上课用的号，但是没有你的班级。选择【没有我所在的班级】，用户名要写：ks班级+姓名，比如23计算机1班张三，就写ks231张三
        <br />
        3. 如果是自己注册的号，选择【没有我所在的班级】 <br />
      </n-alert>
      <n-form-item label="选择班级" path="class" :show-require-mark="false">
        <n-select
          v-model:value="form.class"
          :options="classList"
          clearable
          name="class"
          id="login-class"
        />
      </n-form-item>
      <n-form-item label="用户名" path="username">
        <n-select
          v-if="form.class"
          v-model:value="form.username"
          :options="classUserOptions"
          :loading="classUserLoading"
          clearable
          filterable
          :name="isClassLogin ? 'class-username' : 'username'"
          :id="isClassLogin ? 'login-class-username' : 'login-username'"
          placeholder="请选择姓名"
        />
        <n-input
          v-else
          v-model:value="form.username"
          autofocus
          clearable
          :name="isClassLogin ? 'class-username' : 'username'"
          :id="isClassLogin ? 'login-class-username' : 'login-username'"
          :autocomplete="isClassLogin ? 'off' : 'username'"
        />
      </n-form-item>
      <n-form-item label="密码" path="password">
        <n-input
          v-model:value="form.password"
          clearable
          type="password"
          :name="isClassLogin ? 'class-password' : 'password'"
          :id="isClassLogin ? 'login-class-password' : 'login-password'"
          :autocomplete="isClassLogin ? 'new-password' : 'current-password'"
          @keyup.enter="submit"
        />
      </n-form-item>
      <n-alert v-if="msg" type="error" :show-icon="false"> {{ msg }}</n-alert>
      <n-form-item>
        <n-flex style="width: 100%">
          <n-button
            type="primary"
            :loading="isLoading"
            @click="submit"
            :style="{
              flex: configStore.config?.allow_register ? '0 0 auto' : '1',
            }"
          >
            登录
          </n-button>
          <n-button v-if="configStore.config?.allow_register" @click="goSignup">
            没有账号？立即注册
          </n-button>
        </n-flex>
      </n-form-item>
    </n-form>
  </n-modal>
</template>

<style scoped>
.tip {
  margin-bottom: 20px;
}
</style>

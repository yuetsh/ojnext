<script setup lang="ts">
import { isDesktop } from "~/shared/composables/breakpoints"
import { useUserStore } from "~/shared/store/user"

const userStore = useUserStore()

function choose() {}
</script>
<template>
  <n-grid v-if="userStore.profile" :x-gap="20" :cols="isDesktop ? 3 : 1">
    <n-gi>
      <h3>个人信息设置</h3>
      <n-form>
        <n-avatar
          round
          :size="120"
          :src="userStore.profile.avatar"
          alt="头像"
        />
        <n-form-item>
          <n-button @click="choose">更换头像</n-button>
        </n-form-item>
        <n-form-item label="真名">
          <n-input />
        </n-form-item>
        <n-form-item label="骚话">
          <n-input />
        </n-form-item>
        <n-button>更改信息</n-button>
      </n-form>
    </n-gi>
    <n-gi>
      <h3>更改密码</h3>
      <n-form>
        <n-form-item label="旧密码">
          <n-input type="password" />
        </n-form-item>
        <n-form-item label="新密码">
          <n-input type="password" />
        </n-form-item>
        <n-form-item label="确认新密码">
          <n-input type="password" />
        </n-form-item>
        <n-button>更改密码</n-button>
      </n-form>
    </n-gi>
    <n-gi>
      <h3>更改邮箱</h3>
      <n-form>
        <n-form-item label="当前密码">
          <n-input type="password" />
        </n-form-item>
        <n-form-item label="旧邮箱">
          <n-input />
        </n-form-item>
        <n-form-item label="新邮箱">
          <n-input />
        </n-form-item>
        <n-button>更改邮箱</n-button>
      </n-form>
    </n-gi>
  </n-grid>
</template>
<style scoped>
h3 {
  font-weight: normal;
}
</style>

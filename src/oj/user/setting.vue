<script setup lang="ts">
import VueAvatarUpload from "vue-avatar-upload"
import "vue-avatar-upload/lib/style.css"
import { isDesktop } from "~/shared/composables/breakpoints"
import { useUserStore } from "~/shared/store/user"

const [showAvatarModal] = useToggle()
const userStore = useUserStore()
</script>
<template>
  <n-grid v-if="userStore.profile" :x-gap="20" :cols="isDesktop ? 3 : 1">
    <n-gi>
      <h3>个人信息设置</h3>
      <n-form>
        <n-form-item label="头像">
          <n-button @click="showAvatarModal = true">打开</n-button>
          <n-modal v-model:show="showAvatarModal" :mask-closable="false">
            <VueAvatarUpload
              :avatar="userStore.profile.avatar"
              @close="showAvatarModal = false"
            />
          </n-modal>
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

<script setup lang="ts">
import { updateProfile, uploadAvatar } from "oj/api"
import { useUserStore } from "shared/store/user"

const userStore = useUserStore()
const message = useMessage()

async function beforeUpload(data: {
  file: UploadFileInfo
  fileList: UploadFileInfo[]
}) {
  if (!data.file.file) return false
  if (data.file.file.size > 2 * 1024 * 1024) {
    message.warning("图片太大啦！不能超过 2 MB 啊")
    return false
  }
  return true
}

async function upload({ file }: UploadCustomRequestOptions) {
  try {
    await uploadAvatar(file.file!)
    message.success("上传成功")
    userStore.getMyProfile()
  } catch (err) {
    message.error("上传失败")
  }
}

async function saveProfile() {
  try {
    await updateProfile({
      real_name: userStore.profile?.real_name ?? "",
      mood: userStore.profile?.mood ?? "",
    })
    message.success("更改成功")
  } catch (err) {
    message.error("更改失败")
  }
}
</script>
<template>
  <n-flex class="container" vertical v-if="userStore.profile">
    <h3>个人信息设置</h3>
    <n-form>
      <n-avatar round :size="120" :src="userStore.profile.avatar" alt="头像" />
      <n-form-item label="">
        <n-upload
          :show-file-list="false"
          accept="image/*"
          @before-upload="beforeUpload"
          :custom-request="upload"
        >
          <n-button>上传头像</n-button>
        </n-upload>
      </n-form-item>
      <!-- <n-form-item label="真名">
        <n-input v-model:value="userStore.profile.real_name" />
      </n-form-item> -->
      <n-form-item label="个性签名">
        <n-input v-model:value="userStore.profile.mood" />
      </n-form-item>
      <n-button @click="saveProfile">更改信息</n-button>
    </n-form>
  </n-flex>
</template>
<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
}

h3 {
  font-weight: normal;
}
</style>

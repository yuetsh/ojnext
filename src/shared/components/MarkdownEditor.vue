<template>
  <MdEditor
    :theme="isDark ? 'dark' : 'light'"
    v-model="modelValue"
    @onUploadImg="onUploadImg"
  />
</template>

<script setup lang="ts">
import { MdEditor } from "md-editor-v3"
import "md-editor-v3/lib/style.css"
import { uploadImage } from "../../admin/api"

const isDark = useDark()

const modelValue = defineModel<string>("value")

const message = useMessage()

const onUploadImg = async (
  files: File[],
  callback: (urls: string[]) => void,
) => {
  try {
    const res = await Promise.all(
      files.map(async (file) => {
        const path = await uploadImage(file)
        if (!path) {
          message.error("图片上传失败")
          return ""
        }
        return path
      }),
    )
    callback(res.filter((url) => url !== ""))
  } catch (err) {
    message.error("图片上传失败")
    callback([])
  }
}
</script>

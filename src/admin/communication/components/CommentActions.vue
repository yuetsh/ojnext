<script lang="ts" setup>
import { deleteComment } from "~/admin/api"

const props = defineProps<{ commentID: number }>()
const emit = defineEmits(["deleted"])

const message = useMessage()

async function submit() {
  await deleteComment(props.commentID)
  message.success("成功删除")
  emit("deleted")
}
</script>
<template>
  <n-popconfirm @positive-click="submit">
    <template #trigger>
      <n-button secondary size="small" type="error">删除</n-button>
    </template>
    确定删除这条评论吗？
  </n-popconfirm>
</template>

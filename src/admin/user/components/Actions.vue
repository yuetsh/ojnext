<script lang="ts" setup>
import { editUser } from "admin/api"
import { User } from "utils/types"

interface Props {
  user: User
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: "deleteUser", value: number[]): void
  (e: "userBanned", value: User): void
  (e: "openEditModal", value: User): void
  (e: "resetPassword", value: User): void
}>()

async function banUser() {
  props.user.is_disabled = !props.user.is_disabled
  await editUser(props.user)
  emit("userBanned", props.user)
}
</script>
<template>
  <n-flex>
    <n-button
      size="small"
      type="error"
      secondary
      @click="$emit('resetPassword', props.user)"
    >
      重置密码
    </n-button>
    <n-button
      size="small"
      type="primary"
      secondary
      @click="$emit('openEditModal', props.user)"
    >
      编辑
    </n-button>
    <n-button
      size="small"
      secondary
      :type="props.user.is_disabled ? 'info' : 'error'"
      @click="banUser"
    >
      {{ props.user.is_disabled ? "解封" : "封号" }}
    </n-button>
    <n-popconfirm @positive-click="$emit('deleteUser', [props.user.id])">
      <template #trigger>
        <n-button size="small" secondary type="warning">删除</n-button>
      </template>
      确定删除这个用户吗？删除后无法恢复！
    </n-popconfirm>
  </n-flex>
</template>

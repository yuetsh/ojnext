<script setup lang="ts">
import { USER_TYPE } from "~/utils/constants"
import { getUserRole } from "~/utils/functions"
import { User } from "~/utils/types"

interface Props {
  user: User
}
const props = defineProps<Props>()
const isNotRegularUser = computed(
  () => props.user.admin_type !== USER_TYPE.REGULAR_USER,
)
</script>
<template>
  <n-flex align="center">
    <n-tag v-if="props.user.is_disabled" type="error" size="small">
      封号中
    </n-tag>
    <n-tag
      v-if="isNotRegularUser"
      :type="getUserRole(props.user.admin_type).type"
      size="small"
    >
      {{ getUserRole(props.user.admin_type).tagString }}
    </n-tag>
    {{ props.user.username }}
  </n-flex>
</template>

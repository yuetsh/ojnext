<script setup lang="ts">
import { getUserRole } from "~/utils/functions"
import { User } from "~/utils/types"

interface Props {
  user: User
}
const props = defineProps<Props>()
const isAdmin = computed(() => props.user.admin_type !== "Regular User")
</script>
<template>
  <n-flex align="center">
    <n-tag v-if="props.user.is_disabled" type="error" size="small">
      封号中
    </n-tag>
    <n-tag
      v-if="isAdmin"
      :type="getUserRole(props.user.admin_type).type"
      size="small"
    >
      {{ getUserRole(props.user.admin_type).tagString }}
    </n-tag>
    {{ props.user.username }}
  </n-flex>
</template>

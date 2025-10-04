<template>
  <n-tooltip>
    <template #trigger>
      <n-button circle :type="type ?? 'default'" @click="$emit('click')">
        <template #icon>
          <Icon :icon="icon" />
        </template>
      </n-button>
    </template>
    {{ tip }}
  </n-tooltip>
</template>
<script lang="ts" setup>
import { Icon } from "@iconify/vue"

defineProps<{
  tip: string
  icon: string
  type?:
    | "default"
    | "tertiary"
    | "primary"
    | "info"
    | "success"
    | "warning"
    | "error"
}>()
defineEmits(["click"])
</script>

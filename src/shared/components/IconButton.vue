<template>
  <n-tooltip>
    <template #trigger>
      <n-button circle @click="$emit('click')">
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
}>()
defineEmits(["click"])
</script>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"

defineEmits(["click", "search"])
</script>
<template>
  <n-flex align="center">
    <n-button text type="info" @click="$emit('click')"><slot></slot></n-button>
    <n-button text @click="$emit('search')">
      <template #icon>
        <Icon icon="streamline-emojis:magnifying-glass-tilted-left"></Icon>
      </template>
    </n-button>
  </n-flex>
</template>

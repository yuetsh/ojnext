<script setup lang="ts">
import copy from "copy-text-to-clipboard"
import Select from "~/shared/icons/Select.vue"
import Copy from "~/shared/icons/Copy.vue"

defineProps<{ value: string }>()
const [copied, toggle] = useToggle()
const { start } = useTimeoutFn(() => toggle(false), 1000, { immediate: false })

function handleClick(value: string) {
  copy(value)
  toggle(true)
  start()
}
</script>
<template>
  <n-tooltip trigger="hover">
    <template #trigger>
      <n-icon class="icon" @click="handleClick(value)">
        <component :is="copied ? Select : Copy"></component>
      </n-icon>
    </template>
    {{ copied ? "已复制" : "复制" }}
  </n-tooltip>
</template>
<style scoped>
.icon {
  cursor: pointer;
  transform: translateY(2px);
}
</style>

<script setup lang="ts">
import { Icon } from "@iconify/vue"
import copy from "copy-text-to-clipboard"

defineProps<{ value: string }>()
const [copied, toggle] = useToggle()
const { start } = useTimeoutFn(() => toggle(false), 1000, { immediate: false })

const COPY = h(Icon, { icon: "twemoji:clipboard" })
const OK = h(Icon, { icon: "twemoji:check-mark-button" })

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
        <component :is="copied ? OK : COPY"></component>
      </n-icon>
    </template>
    {{ copied ? "已复制" : "复制" }}
  </n-tooltip>
</template>
<style scoped>
.icon {
  cursor: pointer;
  font-size: 20px;
}
</style>

<template>
  <n-tooltip>
    <template #trigger>
      <n-button text @click="handleClick">
        <slot />
      </n-button>
    </template>
    点击复制
  </n-tooltip>
</template>
<script lang="ts" setup>
import copyText from "copy-text-to-clipboard"

const message = useMessage()

const slots = useSlots()

function handleClick() {
  const textToCopy = getTextFromSlot()
  copyText(textToCopy)
  message.success("已复制")
}

function getTextFromSlot() {
  const vnodes = slots.default?.()
  if (!vnodes) return ""
  return vnodes.map((vnode) => vnode.children).join("")
}
</script>
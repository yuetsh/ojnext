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
import { copyToClipboard } from "~/utils/functions"

const message = useMessage()

const slots = useSlots()

async function handleClick() {
  const textToCopy = getTextFromSlot()
  const success = await copyToClipboard(textToCopy)
  if (success) {
    message.success("已复制")
  } else {
    message.error("复制失败")
  }
}

function getTextFromSlot() {
  const vnodes = slots.default?.()
  if (!vnodes) return ""
  return vnodes.map((vnode) => vnode.children).join("")
}
</script>
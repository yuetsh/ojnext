<script setup lang="ts">
import { Icon } from "@iconify/vue"

// 成就图标统一走 iconify（noto 彩色 emoji 图标集），渲染出来是 SVG，
// 老浏览器缺 emoji 字体也能正常显示。
//
// 三种形态按顺序判断，顺序不能换：题单奖章的 icon 是图片 URL，
// 而 https:// 里也带冒号，先判 iconify 会把 URL 当成图标名。
// 存量成就的 icon 还可能是 emoji 字符，最后原样当文本兜底。
const props = withDefaults(defineProps<{ icon: string; size?: number }>(), {
  size: 32,
})

const kind = computed(() => {
  const v = props.icon ?? ""
  if (/^(https?:\/\/|\/|data:)/.test(v)) return "image"
  if (v.includes(":")) return "iconify"
  return "text"
})
</script>

<template>
  <img
    v-if="kind === 'image'"
    :src="icon"
    :width="size"
    :height="size"
    class="image"
    alt=""
  />
  <Icon
    v-else-if="kind === 'iconify'"
    :icon="icon"
    :width="size"
    :height="size"
  />
  <span v-else class="fallback" :style="{ fontSize: `${size}px` }">
    {{ icon }}
  </span>
</template>

<style scoped>
.image {
  object-fit: contain;
  border-radius: 4px;
}
.fallback {
  line-height: 1;
}
</style>

<script lang="ts" setup>
import { Icon } from "@iconify/vue"
import { USERNAME_CLASS_RE } from "utils/constants"

interface Props {
  type: "题目" | "用户"
  username?: string
}

const props = defineProps<Props>()

const emits = defineEmits(["click", "search", "filterClass"])

// 用同一个正则判断，避免 kstest 这类 ks 开头但没有班级号的用户名
// 也显示出按钮，点了却什么都不发生
const showFilterClass = computed(() => {
  return props.type === "用户" && USERNAME_CLASS_RE.test(props.username ?? "")
})

function filterClass() {
  const match = props.username!.match(USERNAME_CLASS_RE)
  const classname = match ? match[0] : ""
  if (!classname) return
  emits("filterClass", classname)
}
</script>
<template>
  <n-flex align="center">
    <n-button text type="info" @click="$emit('click')">
      <slot></slot>
    </n-button>
    <n-tooltip>
      <template #trigger>
        <n-button text @click="$emit('search')">
          <template #icon>
            <Icon icon="streamline-emojis:magnifying-glass-tilted-left"></Icon>
          </template>
        </n-button>
      </template>
      {{ "搜索" + props.type }}
    </n-tooltip>
    <n-tooltip v-if="showFilterClass">
      <template #trigger>
        <n-button text @click="filterClass">
          <template #icon>
            <Icon icon="ph:funnel"></Icon>
          </template>
        </n-button>
      </template>
      筛选班级
    </n-tooltip>
  </n-flex>
</template>

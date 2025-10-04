<script lang="ts" setup>
import { Icon } from "@iconify/vue"

interface Props {
  type: "题目" | "用户"
  username?: string
}

const props = defineProps<Props>()

const emits = defineEmits(["click", "search", "filterClass"])

const showFilterClass = computed(() => {
  return props.type === "用户" && props.username?.startsWith("ks")
})

function filterClass() {
  const match = props.username!.match(/^ks\d{3,4}/)
  const classname = match ? match[0] : ""
  if (!classname) return
  emits("filterClass", classname)
}
</script>
<template>
  <n-flex align="center">
    <n-button text type="info" @click="$emit('click')"><slot></slot></n-button>
    <n-tooltip>
      <template #trigger>
        <n-button text @click="$emit('search')">
          <template #icon>
            <Icon icon="streamline-emojis:magnifying-glass-tilted-left"></Icon>
          </template>
        </n-button>
      </template>
      {{ "搜索" + props.type}}
    </n-tooltip>
    <n-tooltip v-if="showFilterClass">
      <template #trigger>
        <n-button text @click="filterClass">
          <template #icon>
            <Icon icon="openmoji:filter"></Icon>
          </template>
        </n-button>
      </template>
      筛选班级
    </n-tooltip>
  </n-flex>
</template>

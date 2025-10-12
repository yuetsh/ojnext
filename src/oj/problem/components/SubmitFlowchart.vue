<script lang="ts" setup>
import { useBreakpoints } from "shared/composables/breakpoints"

const { isDesktop } = useBreakpoints()
const message = useMessage()

const submit = () => {
  message.warning("暂未实现")
}
</script>

<template>
  <n-button
    :size="isDesktop ? 'medium' : 'small'"
    type="primary"
    @click="submit"
  >
    提交流程图
  </n-button>
</template>

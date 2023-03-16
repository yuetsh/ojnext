<script lang="ts" setup>
import { User } from "~/utils/types"

interface Props {
  user: User
}
const props = defineProps<Props>()
</script>
<template>
  <n-space align="center">
    <n-button size="small" secondary type="primary">编辑</n-button>
    <n-button size="small" secondary type="error">封号</n-button>
    <n-button size="small" secondary type="default">删除</n-button>
  </n-space>
</template>

<script setup lang="ts">
import { isDesktop } from "utils/breakpoints"
interface Props {
  total: number
  limit: number
  page: number
}

const props = withDefaults(defineProps<Props>(), {
  limit: 10,
  page: 1,
})

const emit = defineEmits(["update:limit", "update:page"])

const limit = ref(props.limit)
const page = ref(props.page)

watch(limit, () => emit("update:limit", limit))
watch(page, () => emit("update:page", page))
</script>

<template>
  <el-pagination
    class="right margin"
    :layout="isDesktop ? 'prev,pager,next,sizes' : 'prev,next,sizes'"
    background
    :total="props.total"
    :page-sizes="[10, 20, 30]"
    :pager-count="5"
    v-model:page-size="limit"
    v-model:current-page="page"
  />
</template>
<style scoped>
.margin {
  margin-top: 24px;
}
.right {
  float: right;
}
</style>

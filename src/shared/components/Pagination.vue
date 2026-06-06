<script setup lang="ts">
import { useBreakpoints } from "shared/composables/breakpoints"

interface Props {
  total: number
  limit: number
  page: number
}

const { total, limit: initialLimit = 10, page: initialPage = 1 } = defineProps<Props>()

const emit = defineEmits(["update:limit", "update:page"])

const { isDesktop } = useBreakpoints()

const limit = ref(initialLimit)
const page = ref(initialPage)
const sizes = [10, 30, 50]

watch(limit, () => emit("update:limit", limit))
watch(page, () => emit("update:page", page))
</script>

<template>
  <n-pagination
    v-if="total"
    class="right margin"
    :item-count="total"
    v-model:page="page"
    v-model:page-size="limit"
    :page-sizes="sizes"
    :page-slot="isDesktop ? 7 : 5"
    show-size-picker
  />
</template>
<style scoped>
.margin {
  margin: 20px 0;
}
.right {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}
</style>

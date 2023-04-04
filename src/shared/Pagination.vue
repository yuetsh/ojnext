<script setup lang="ts">
import { isDesktop } from "~/shared/composables/breakpoints"

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

const route = useRoute()

const limit = ref(props.limit)
const page = ref(props.page)
const sizes = computed(() => {
  if (route.name === "contest rank") return [10, 30, 50]
  return [10, 20, 30]
})

watch(limit, () => emit("update:limit", limit))
watch(page, () => emit("update:page", page))
</script>

<template>
  <n-pagination
    v-if="props.total"
    class="right margin"
    :item-count="props.total"
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
  float: right;
}
</style>

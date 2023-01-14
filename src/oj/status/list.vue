<script setup lang="ts">
import Pagination from "~/shared/Pagination/index.vue"

const query = reactive({
  page: 1,
  limit: 10,
})
const total = ref(100)
</script>
<template>
  <el-table max-height="calc(100vh - 171px)"></el-table>
  <Pagination
    :total="total"
    v-model:limit="query.limit"
    v-model:page="query.page"
  />
</template>
<style scoped></style>

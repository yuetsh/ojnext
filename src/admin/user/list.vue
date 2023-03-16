<script setup lang="ts">
import { DataTableColumn } from "naive-ui"
import Pagination from "~/shared/Pagination.vue"
import { parseTime } from "~/utils/functions"
import { User } from "~/utils/types"
import { getUserList } from "../api"
import Actions from "./components/Actions.vue"
import Name from "./components/Name.vue"

const total = ref(0)
const users = ref<User[]>([])
const query = reactive({
  limit: 10,
  page: 1,
  keyword: "",
})

const columns: DataTableColumn<User>[] = [
  { title: "ID", key: "id", width: 60 },
  {
    title: "用户名",
    key: "username",
    width: 150,
    render: (row) => h(Name, { user: row }),
  },
  {
    title: "创建时间",
    key: "create_time",
    width: 200,
    render: (row) => parseTime(row.create_time, "YYYY-MM-DD hh:mm:ss"),
  },
  {
    title: "上次登录",
    key: "last_login",
    width: 200,
    render: (row) =>
      row.last_login
        ? parseTime(row.last_login, "YYYY-MM-DD hh:mm:ss")
        : "从未登录",
  },
  { title: "真名", key: "real_name", width: 100 },
  { title: "邮箱", key: "email", width: 200 },
  {
    key: "edit",
    width: 200,
    render: (row) => h(Actions, { user: row }),
  },
]

async function listUsers() {
  const offset = (query.page - 1) * query.limit
  const res = await getUserList(offset, query.limit, query.keyword)
  total.value = res.data.total
  users.value = res.data.results
}

onMounted(listUsers)
watch(query, listUsers, { deep: true })
</script>

<template>
  <n-form inline label-placement="left">
    <n-form-item>
      <n-input placeholder="请输入关键字搜索" v-model:value="query.keyword" />
    </n-form-item>
  </n-form>
  <n-data-table :data="users" :columns="columns" size="small" striped />
  <Pagination
    :total="total"
    v-model:limit="query.limit"
    v-model:page="query.page"
  />
</template>

<style scoped></style>

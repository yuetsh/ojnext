<script setup lang="ts">
import { DataTableColumn, DataTableRowKey, SelectOption } from "naive-ui"
import Pagination from "~/shared/Pagination.vue"
import { parseTime } from "~/utils/functions"
import { User } from "~/utils/types"
import { getUserList, deleteUsers, editUser } from "../api"
import Actions from "./components/Actions.vue"
import Name from "./components/Name.vue"

const message = useMessage()

const total = ref(0)
const users = ref<User[]>([])
const userEditing = ref<User | null>(null)
const query = reactive({
  limit: 10,
  page: 1,
  keyword: "",
})
const password = ref("")
const userIDs = ref<DataTableRowKey[]>([])

const rowKey = (row: User) => row.id

const columns: DataTableColumn<User>[] = [
  { type: "selection" },
  { title: "ID", key: "id", width: 60 },
  {
    title: "用户名",
    key: "username",
    width: 180,
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
    key: "actions",
    title: "选项",
    width: 200,
    render: (row) =>
      h(Actions, {
        user: row,
        onDeleteUser: onDeleteUsers,
        onUserBanned,
        onOpenEditModal,
      }),
  },
]

const options: SelectOption[] = [
  { label: "普通", value: "Regular User" },
  { label: "管理员", value: "Admin" },
  { label: "超级管理员", value: "Super Admin" },
]

async function listUsers() {
  const offset = (query.page - 1) * query.limit
  const res = await getUserList(offset, query.limit, query.keyword)
  total.value = res.data.total
  users.value = res.data.results
}

function chooseUsers(rowKeys: DataTableRowKey[]) {
  userIDs.value = rowKeys
}

async function onDeleteUsers(userIDs: DataTableRowKey[] | Ref<number[]>) {
  await deleteUsers(toRaw(userIDs) as number[])
  listUsers()
}

async function onUserBanned(user: User) {
  users.value = users.value.map((it) => {
    if (it.id === user.id) {
      it.is_disabled = user.is_disabled
    }
    return it
  })
}

async function onOpenEditModal(user: User) {
  userEditing.value = user
  password.value = ""
}

async function onCloseEditModal() {
  userEditing.value = null
  password.value = ""
}

async function handleEditUser() {
  if (!userEditing.value) return
  if (password.value && password.value.length < 6) {
    message.error("密码长度不得小于 6")
    return
  }
  const user = Object.assign(userEditing.value, { password: password.value })
  await editUser(user)
  userEditing.value = null
  password.value = ""
}

onMounted(listUsers)
watch(query, listUsers, { deep: true })
</script>

<template>
  <n-form inline label-placement="left">
    <n-form-item>
      <n-input placeholder="请输入关键字搜索" v-model:value="query.keyword" />
    </n-form-item>
    <n-form-item v-if="userIDs.length">
      <n-popconfirm @positive-click="onDeleteUsers(userIDs)">
        <template #trigger>
          <n-button type="warning">删除</n-button>
        </template>
        确定删除选中的用户吗？删除后无法恢复！
      </n-popconfirm>
    </n-form-item>
  </n-form>
  <n-data-table
    :data="users"
    :columns="columns"
    size="small"
    striped
    :row-key="rowKey"
    @update:checked-row-keys="chooseUsers"
  />
  <Pagination
    :total="total"
    v-model:limit="query.limit"
    v-model:page="query.page"
  />
  <n-modal
    :mask-closable="false"
    :show="!!userEditing"
    preset="card"
    title="编辑用户"
    style="width: 700px"
    @close="onCloseEditModal"
  >
    <n-form label-placement="left" v-if="userEditing">
      <n-grid :cols="2" :x-gap="16">
        <n-form-item-gi :span="1" label="用户">
          <n-input v-model:value="userEditing.username" />
        </n-form-item-gi>
        <n-form-item-gi :span="1" label="真名">
          <n-input v-model:value="userEditing.real_name" />
        </n-form-item-gi>
        <n-form-item-gi :span="1" label="邮箱">
          <n-input v-model:value="userEditing.email" />
        </n-form-item-gi>
        <n-form-item-gi :span="1" label="密码">
          <n-input v-model:value="password" />
        </n-form-item-gi>
        <n-form-item-gi :span="1" label="类型">
          <n-select v-model:value="userEditing.admin_type" :options="options" />
        </n-form-item-gi>
        <n-form-item-gi :span="1" label="是否封禁">
          <n-switch v-model:value="userEditing.is_disabled">封号</n-switch>
        </n-form-item-gi>
      </n-grid>
      <n-space justify="end">
        <n-button @click="onCloseEditModal">取消</n-button>
        <n-button type="primary" @click="handleEditUser">保存</n-button>
      </n-space>
    </n-form>
  </n-modal>
</template>

<style scoped></style>

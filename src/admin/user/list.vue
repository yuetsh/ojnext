<script setup lang="ts">
import { DataTableRowKey, SelectOption } from "naive-ui"
import Pagination from "~/shared/components/Pagination.vue"
import { parseTime } from "~/utils/functions"
import { User } from "~/utils/types"
import {
  deleteUsers,
  editUser,
  getUserList,
  importUsers,
  resetPassword,
} from "../api"
import Actions from "./components/Actions.vue"
import Name from "./components/Name.vue"
import { USER_TYPE } from "~/utils/constants"

const message = useMessage()

const total = ref(0)
const users = ref<User[]>([])
const userEditing = ref<User | null>(null)
const query = reactive({
  limit: 10,
  page: 1,
  keyword: "",
  admin: false,
})
const [create, toggleCreate] = useToggle(false)
const password = ref("")
const userIDs = ref<DataTableRowKey[]>([])

const rowKey = (row: User) => row.id

const columns: DataTableColumn<User>[] = [
  { type: "selection" },
  { title: "ID", key: "id", width: 100 },
  {
    title: "用户名",
    key: "username",
    width: 200,
    render: (row) => h(Name, { user: row }),
  },
  {
    title: "密码",
    key: "raw_password",
    width: 100,
  },
  {
    title: "创建时间",
    key: "create_time",
    width: 200,
    render: (row) => parseTime(row.create_time, "YYYY-MM-DD HH:mm:ss"),
  },
  {
    title: "上次登录",
    key: "last_login",
    width: 200,
    render: (row) =>
      row.last_login
        ? parseTime(row.last_login, "YYYY-MM-DD HH:mm:ss")
        : "从未登录",
  },
  { title: "真名", key: "real_name", width: 100 },
  { title: "邮箱", key: "email", width: 200 },
  {
    key: "actions",
    title: "选项",
    width: 260,
    render: (row) =>
      h(Actions, {
        user: row,
        onDeleteUser: onDeleteUsers,
        onUserBanned,
        onOpenEditModal,
        onResetPassword,
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
  const isAdmin = query.admin ? "1" : "0"
  const res = await getUserList(offset, query.limit, isAdmin, query.keyword)
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

async function onResetPassword(user: User) {
  const res = await resetPassword(user.id)
  users.value = users.value.map((it) => {
    if (it.id === user.id && user.admin_type === USER_TYPE.REGULAR_USER) {
      it.raw_password = res.data
    }
    return it
  })
}

async function onUserBanned(user: User) {
  users.value = users.value.map((it) => {
    if (it.id === user.id) {
      it.is_disabled = user.is_disabled
    }
    return it
  })
}

function createNewUser() {
  toggleCreate(true)
  userEditing.value = {
    id: 0,
    username: "",
    real_name: "",
    email: "",
    admin_type: "Regular User",
    problem_permission: "",
    create_time: new Date(),
    last_login: new Date(),
    two_factor_auth: false,
    open_api: false,
    is_disabled: false,
    password: "",
  }
  password.value = ""
}

function onOpenEditModal(user: User) {
  userEditing.value = user
  password.value = ""
}

function onCloseEditModal() {
  userEditing.value = null
  password.value = ""
  toggleCreate(false)
}

async function handleEditUser() {
  if (!userEditing.value) return
  if (password.value && password.value.length < 6) {
    message.error("密码长度不得小于 6")
    return
  }
  if (create.value) {
    const newUser = [
      [
        userEditing.value.username,
        password.value,
        userEditing.value.email,
        userEditing.value.real_name,
      ],
    ]
    await importUsers(newUser)
    listUsers()
  } else {
    const user = Object.assign(userEditing.value, { password: password.value })
    await editUser(user)
  }
  userEditing.value = null
  password.value = ""
  toggleCreate(false)
}

onMounted(listUsers)
watch(query, listUsers, { deep: true })
</script>

<template>
  <n-flex class="titleWrapper" justify="space-between">
    <n-flex>
      <h2 class="title">用户列表</h2>
      <n-button type="primary" @click="createNewUser">新建</n-button>
      <n-button @click="$router.push({ name: 'admin user generate' })">
        导入
      </n-button>
    </n-flex>
    <n-flex>
      <n-popconfirm
        v-if="userIDs.length"
        @positive-click="onDeleteUsers(userIDs)"
      >
        <template #trigger>
          <n-button type="warning">删除</n-button>
        </template>
        确定删除选中的用户吗？删除后无法恢复！
      </n-popconfirm>
      <n-flex align="center">
        <span>超管出列</span>
        <n-switch v-model:value="query.admin" />
        <div>
          <n-input style="width: 200px" v-model:value="query.keyword" />
        </div>
      </n-flex>
    </n-flex>
  </n-flex>
  <n-data-table
    :data="users"
    :columns="columns"
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
    :title="create ? '新建用户' : '编辑用户'"
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
        <n-form-item-gi
          :span="1"
          label="密码"
          label-style="color: red; font-weight: bold"
        >
          <n-input v-model:value="password" />
        </n-form-item-gi>
        <n-form-item-gi v-if="!create" :span="1" label="类型">
          <n-select v-model:value="userEditing.admin_type" :options="options" />
        </n-form-item-gi>
        <n-form-item-gi v-if="!create" :span="1" label="是否封禁">
          <n-switch v-model:value="userEditing.is_disabled">封号</n-switch>
        </n-form-item-gi>
      </n-grid>
      <n-flex justify="end">
        <n-button @click="onCloseEditModal">取消</n-button>
        <n-button type="primary" @click="handleEditUser">保存</n-button>
      </n-flex>
    </n-form>
  </n-modal>
</template>

<style scoped>
.titleWrapper {
  margin-bottom: 16px;
}

.title {
  margin: 0;
}
</style>

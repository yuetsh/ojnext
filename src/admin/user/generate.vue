<script setup lang="ts">
import { DataTableColumn, NAlert } from "naive-ui"
import { importUsers } from "../api"

const possibleChars = "0123456789"

const message = useMessage()
const prefix = ref("")
const rawInput = ref("")
const [needKs] = useToggle(true)
const users = shallowRef<string[][]>([])

const columns: DataTableColumn[] = [
  { title: "用户名", key: "username" },
  { title: "密码", key: "password" },
  { title: "邮箱", key: "email" },
  { title: "真名", key: "realName" },
]

const usersToTable = computed(() => {
  return users.value.map((u) => {
    const username = u[0]
    const password = u[1]
    const email = u[2]
    const realName = u[3]
    return { username, password, realName, email }
  })
})

function generateUsers() {
  if (!rawInput.value || !rawInput.value.trim()) {
    message.info("请填写相关内容")
    return
  }
  // 自动加上 ks 的开头
  let myClass = ""
  if (prefix.value) {
    if (needKs.value && !prefix.value.startsWith("ks")) {
      myClass = "ks" + prefix.value
    } else {
      myClass = prefix.value
    }
  }
  rawInput.value = rawInput.value.trim()
  const inputs = rawInput.value.split("\n")
  users.value = inputs.map((u, i) => {
    const username = myClass + u
    let password = ""
    for (let i = 0; i < 6; i++) {
      password += possibleChars.charAt(
        Math.floor(Math.random() * possibleChars.length)
      )
    }
    const realName = u
    const email = `${myClass}.${i + 1}@example.com`
    return [username, password, email, realName]
  })
}

async function uploadUsers() {
  try {
    await importUsers(users.value)
    message.success("用户已上传成功")
    const csv = users.value.map((u) => u.join(",")).join("\n")
    const hiddenElement = document.createElement("a")
    hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csv)
    hiddenElement.target = "_blank"
    hiddenElement.download = prefix.value + ".csv"
    hiddenElement.click()
    hiddenElement.remove()
  } catch (err: any) {
    message.error("上传失败：" + err.data)
  }
}

function handleAll() {
  generateUsers()
  uploadUsers()
}
</script>

<template>
  <n-space>
    <n-space vertical>
      <n-space align="center">
        <n-switch v-model:value="needKs" />
        <span>前面带上 ks</span>
      </n-space>
      <n-input v-model:value="prefix" placeholder="班级号" />
      <n-input
        type="textarea"
        class="inputArea"
        placeholder="每行一个用户名"
        v-model:value="rawInput"
      />
    </n-space>
    <n-scrollbar style="max-height: calc(100vh - 34px)">
      <n-data-table
        v-if="usersToTable.length"
        :columns="columns"
        :data="usersToTable"
      />
    </n-scrollbar>
    <n-space vertical>
      <n-button @click="generateUsers">让我康康</n-button>
      <n-button type="warning" :disabled="!users.length" @click="uploadUsers">
        上传用户
      </n-button>
      <n-button type="info" @click="handleAll">一键三连</n-button>
    </n-space>
  </n-space>
</template>

<style scoped>
.inputArea {
  width: 200px;
  height: calc(100vh - 108px);
}
</style>

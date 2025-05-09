<script setup lang="ts">
import { importUsers } from "../api"

const message = useMessage()
const prefix = ref("")
const rawInput = ref("")
const [needKs] = useToggle(true)
const [loading, toggleLoading] = useToggle()
const users = shallowRef<string[][]>([])

function generateUsers() {
  if (!rawInput.value || !rawInput.value.trim()) {
    message.info("请填写相关内容")
    return false
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
    for (let j = 0; j < 6; j++) {
      password += "123456789".charAt(Math.floor(Math.random() * 9))
    }
    const realName = u
    const email = `${myClass}.${i + 1}@example.com`
    return [username, password, email, realName]
  })
  return true
}

async function uploadUsers() {
  try {
    toggleLoading(true)
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
  } finally {
    toggleLoading(false)
  }
}

async function submit() {
  const ok = generateUsers()
  if (ok) {
    uploadUsers()
  }
}
</script>

<template>
  <n-space>
    <n-flex vertical>
      <n-flex align="center">
        <n-switch v-model:value="needKs" />
        <span>前面带上 ks</span>
      </n-flex>
      <n-input
        style="width: 200px"
        v-model:value="prefix"
        placeholder="班级号"
      />
      <n-input
        type="textarea"
        class="inputArea"
        placeholder="每行一个用户名"
        v-model:value="rawInput"
      />
      <n-button type="warning" :loading="loading" @click="submit">
        确定导入
      </n-button>
    </n-flex>
  </n-space>
</template>

<style scoped>
.inputArea {
  width: 200px;
  height: 500px;
}
</style>

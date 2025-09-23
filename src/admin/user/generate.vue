<script setup lang="ts">
import { importUsers } from "../api"

const message = useMessage()
const prefix = ref(0)
const rawInput = ref("")
const [loading, toggleLoading] = useToggle()
const users = shallowRef<string[][]>([])

function generateUsers() {
  if (!rawInput.value || !rawInput.value.trim()) {
    message.info("请填写相关内容")
    return false
  }
  let className = !!prefix.value ? `ks${prefix.value}` : ""
  rawInput.value = rawInput.value.trim()
  const inputs = rawInput.value.split("\n")
  users.value = inputs.map((u, i) => {
    const username = className + u
    let password = ""
    for (let j = 0; j < 6; j++) {
      password += "123456789".charAt(Math.floor(Math.random() * 9))
    }
    const realName = u
    const email = `${className}.${i + 1}@example.com`
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
        <div style="width: 18px; font-size: 1.2rem">ks</div>
        <n-input-number
          style="width: 170px"
          v-model:value="prefix"
          clearable
          :max="9999"
          :min="0"
          placeholder="班级号"
        />
      </n-flex>
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

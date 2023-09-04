<script setup lang="ts">
import { code } from "oj/composables/code"
import { createTestSubmission } from "~/utils/judge"

const input = ref("")
const output = ref("")

async function test() {
  output.value = "运行中..."
  const res = await createTestSubmission(code, input.value)
  output.value = res.output
}
function clear() {
  const id = setTimeout(() => {
    clearTimeout(id)
    output.value = ""
  }, 200)
}
</script>
<template>
  <n-popover
    trigger="click"
    placement="bottom-end"
    scrollable
    :show-arrow="false"
    style="max-height: 600px; max-width: 800px"
    @clickoutside="clear"
  >
    <template #trigger>
      <n-button>快速测试</n-button>
    </template>
    <n-space vertical>
      <n-input type="textarea" v-model:value="input" />
      <n-space justify="end">
        <n-button @click="test">运行</n-button>
      </n-space>
      <div class="testcase">{{ output }}</div>
    </n-space>
  </n-popover>
</template>
<style scoped>
.testcase {
  white-space: pre;
  font-size: 16px;
  font-family: "Consolas";
}
</style>

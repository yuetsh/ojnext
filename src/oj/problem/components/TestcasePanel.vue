<script setup lang="ts">
import { createTestSubmission } from "utils/judge"
import { useCodeStore } from "oj/store/code"

const input = ref("")
const result = ref("")
const { code } = useCodeStore()

async function submit() {
  const res = await createTestSubmission(code, input.value)
  result.value = res.output
}
</script>

<template>
  <el-tab-pane label="测试面板" name="test">
    <div class="panel">
      <el-form inline>
        <el-form-item label="输入">
          <el-input type="textarea" autosize v-model="input" />
        </el-form-item>
        <el-form-item>
          <el-button @click="submit">运行</el-button>
        </el-form-item>
      </el-form>
      <el-scrollbar height="345">
        <div class="msg">{{ result }}</div>
      </el-scrollbar>
    </div>
  </el-tab-pane>
</template>

<style scoped>
.panel {
  height: 400px;
}
.msg {
  white-space: pre;
  line-height: 1.5;
}
</style>

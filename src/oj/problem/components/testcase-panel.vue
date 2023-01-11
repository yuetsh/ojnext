<script setup lang="ts">
import { Ref } from "vue"
import { Code, Problem } from "../../../utils/types"

const problem = inject<Ref<Problem>>("problem")
const code = inject<Code>("code")
</script>

<template>
  <el-tab-pane label="测试用例" name="testcase">
    <div class="panel">
      <el-table height="320"></el-table>
    </div>
  </el-tab-pane>
</template>

<style scoped></style>

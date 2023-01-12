<script setup lang="ts">
import Md from "./step-1/index.md"
import Monaco from "../shared/monaco/index.vue"

const route = useRoute()
console.log(route.params.step)

const code = ref("")

function change(value: string) {
  code.value = value
}
</script>

<template>
  <el-row>
    <el-col :span="4"> </el-col>
    <el-col :span="12">
      <Md />
      {{ code }}
    </el-col>
    <el-col :span="8">
      <Monaco :value="code" @change="change" />
    </el-col>
  </el-row>
</template>

<style scoped></style>

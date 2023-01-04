<script setup lang="ts">
import { onMounted } from "vue"
import { useRoute } from "vue-router"
import Editor from "../components/editor.vue"
import { getProblem } from "../api"

const route = useRoute()

async function init() {
  const id = route.params.id as string
  const res = await getProblem(id)
  console.log(res.data)
}

onMounted(() => {
  init()
})
</script>

<template>
  <el-row>
    <el-col :span="12">
      <el-tabs type="border-card">
        <el-tab-pane label="题目描述">1</el-tab-pane>
        <el-tab-pane label="提交信息">2</el-tab-pane>
      </el-tabs>
    </el-col>
    <el-col :span="12">
      <Editor />
    </el-col>
  </el-row>
</template>

<style scoped></style>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRoute } from "vue-router"
import Editor from "./editor.vue"
import { getProblem } from "../api"
import ProblemContent from "./problem-content.vue"
import ProblemInfo from "./problem-info.vue"

const route = useRoute()
const code = ref("print('hello world')")
const language = ref("C")
const problem = ref({
  created_by: {},
  io_mode: {},
  languages: [],
  samples: [],
  statistic_info: {},
  tags: [],
  template: {},
})

async function init() {
  const id = route.params.id as string
  const res = await getProblem(id)
  problem.value = res.data
}

onMounted(() => {
  init()
})
</script>

<template>
  <el-row>
    <el-col :span="12">
      <el-tabs type="border-card">
        <el-tab-pane label="题目描述">
          <ProblemContent :problem="problem" />
        </el-tab-pane>
        <el-tab-pane label="题目信息">
          <ProblemInfo :problem="problem" />
        </el-tab-pane>
        <el-tab-pane label="提交信息">3</el-tab-pane>
      </el-tabs>
    </el-col>
    <el-col :span="12">
      <Editor :value="code" :language="language" />
    </el-col>
  </el-row>
</template>

<style scoped></style>

<script setup lang="ts">
import Loading from "./components/Loading.vue"
import Monaco from "../shared/monaco/index.vue"

const route = useRoute()
const step = route.hash.replace("#step-", "") || "1"

const Md = defineAsyncComponent({
  loader: () => import(`./step-${step}/index.md`),
  loadingComponent: Loading,
})

const code = ref("")

function change(value: string) {
  code.value = value
}
</script>

<template>
  <el-row>
    <el-col :span="12">
      <Md />
    </el-col>
    <el-col :span="12">
      <Monaco :value="code" @change="change" />
    </el-col>
  </el-row>
</template>

<style scoped></style>

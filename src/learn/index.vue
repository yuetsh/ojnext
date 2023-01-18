<script setup lang="ts">
import Loading from "./components/Loading.vue"
import Monaco from "../shared/Monaco.vue"

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
  <n-grid :cols="2">
    <n-gi>
      <Md />
    </n-gi>
    <n-gi>
      <Monaco :value="code" @change="change" />
    </n-gi>
  </n-grid>
</template>

<style scoped></style>

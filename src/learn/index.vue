<script setup lang="ts">
import Monaco from "../shared/Monaco.vue"
import raw from "./step-1/1.c?raw"

const route = useRoute()
const id = route.hash.replace("#step-", "") || "1"

const Md = defineAsyncComponent(() => import(`./step-${id}/index.md`))

const code = ref(raw)

function change(value: string) {
  code.value = value
}
</script>

<template>
  <n-grid :cols="2">
    <n-gi>
      <Md />
      <n-space justify="space-between">
        <n-button text type="primary">上一步</n-button>
        <n-button text type="primary">下一步</n-button>
      </n-space>
    </n-gi>
    <n-gi>
      <Monaco :value="code" @change="change" />
    </n-gi>
  </n-grid>
</template>

<style scoped></style>

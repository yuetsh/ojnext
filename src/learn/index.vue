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

<style>
.__layout-dark .shiki-light {
  display: none;
}

.__layout .shiki-dark {
  display: none;
}

.shiki .highlighted {
  background: #7f7f7f20;
  display: block;
  margin: 0 -1rem;
  padding: 0 1rem;
}

.markdown-body code[v-pre] {
  font-size: 20px;
  font-family: "SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono",
    "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace;
  display: flex;
  flex-direction: column;
  counter-reset: step;
  counter-increment: step 0;
}

.markdown-body code[v-pre] .line:not(:last-child)::before {
  content: counter(step);
  counter-increment: step;
  width: 1rem;
  margin-right: 1.5rem;
  display: inline-block;
  text-align: right;
  color: rgba(115, 138, 148, 0.4);
}
</style>

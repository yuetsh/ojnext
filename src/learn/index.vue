<script setup lang="ts">
import { isDesktop } from "~/shared/composables/breakpoints"
import { code } from "~/shared/composables/learn"
import { useLearnStore } from "./store"

const CodeEditor = defineAsyncComponent(
  () => import("~/shared/components/CodeEditor.vue"),
)

const route = useRoute()
const router = useRouter()
const learnStore = useLearnStore()

const Mds = Array.from({ length: learnStore.total }, (_, i) => i + 1).map((v) =>
  defineAsyncComponent(() => import(`./step-${v}/index.md`)),
)

watch(
  () => route.params.step,
  async (value) => {
    if (route.name !== "learn") return
    try {
      const raw = await import(`./${value[0]}/main.c?raw`)
      code.value = raw.default
    } catch (err) {
      router.replace("/learn/step-1")
    }
  },
  { immediate: true },
)
</script>

<template>
  <n-grid v-if="isDesktop" :cols="22">
    <n-gi :span="2">
      <n-scrollbar style="max-height: calc(100vh - 92px)">
        <n-space vertical>
          <span>目录</span>
          <n-button
            text
            :type="learnStore.current === title.key ? 'primary' : 'default'"
            v-for="title in learnStore.menu"
            :key="title.key"
            @click="title.props?.onClick"
          >
            {{ title.label }}
          </n-button>
        </n-space>
      </n-scrollbar>
    </n-gi>
    <n-gi :span="10">
      <n-scrollbar style="max-height: calc(100vh - 92px)">
        <component :is="Mds[learnStore.current - 1]"></component>
      </n-scrollbar>
    </n-gi>
    <n-gi :span="10">
      <CodeEditor v-model="code" height="calc(100vh - 92px)" />
    </n-gi>
  </n-grid>
  <div v-else>
    <n-scrollbar style="height: calc(50vh - 42px)">
      <component :is="Mds[learnStore.current - 1]"></component>
    </n-scrollbar>
    <CodeEditor v-model="code" height="calc(50vh - 42px)" />
  </div>
</template>

<style>
.__layout-dark .vitesse-light {
  display: none;
}

.__layout .vitesse-dark {
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

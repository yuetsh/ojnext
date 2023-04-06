<script setup lang="ts">
import { isDesktop } from "~/shared/composables/breakpoints"
import { code } from "~/shared/composables/learn"

const Monaco = defineAsyncComponent(() => import("~/shared/Monaco.vue"))

const route = useRoute()
const router = useRouter()

const TOTAL = 3

const Mds = Array.from({ length: TOTAL }, (_, i) => i + 1).map((v) =>
  defineAsyncComponent(() => import(`./step-${v}/index.md`))
)
const step = computed(() => {
  if (!route.params.step || !route.params.step.length) return 1
  else {
    return parseInt(route.params.step[0].split("-")[1])
  }
})

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
  { immediate: true }
)

function prev() {
  router.push(`/learn/step-${step.value - 1}`)
}
function next() {
  router.push(`/learn/step-${step.value + 1}`)
}
</script>

<template>
  <n-grid v-if="isDesktop" :cols="24">
    <n-gi :span="10">
      <n-scrollbar style="max-height: calc(100vh - 92px)">
        <component :is="Mds[step - 1]"></component>
        <n-space justify="space-around">
          <n-button v-if="step !== 1" text type="primary" @click="prev">
            上一步
          </n-button>
          <n-button v-if="step !== TOTAL" text type="primary" @click="next">
            下一步
          </n-button>
        </n-space>
      </n-scrollbar>
    </n-gi>
    <n-gi :span="14">
      <Monaco v-model:value="code" />
    </n-gi>
  </n-grid>
  <div v-else>
    <n-scrollbar style="height: calc(50vh - 42px)">
      <component :is="Mds[step - 1]"></component>
      <n-space justify="space-around">
        <n-button v-if="step !== 1" text type="primary" @click="prev">
          上一步
        </n-button>
        <n-button v-if="step !== TOTAL" text type="primary" @click="next">
          下一步
        </n-button>
      </n-space>
    </n-scrollbar>
    <Monaco v-model:value="code" height="calc(50vh - 42px)" />
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

<script setup lang="ts">
import Monaco from "~/shared/Monaco.vue"
import { isDesktop } from "~/shared/composables/breakpoints"
const route = useRoute()
const router = useRouter()

const TOTAL = 3

const Mds = Array.from({ length: TOTAL }, (_, i) => i + 1).map((v) =>
  defineAsyncComponent(() => import(`./step-${v}/index.md`))
)
const code = ref("")
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

function change(v: string) {
  code.value = v
}
function prev() {
  router.push(`/learn/step-${step.value - 1}`)
}
function next() {
  router.push(`/learn/step-${step.value + 1}`)
}
function run() {
  console.log(code.value)
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
    <n-gi :span="14" class="relative">
      <n-button type="primary" class="action" @click="run">运行</n-button>
      <Monaco :value="code" @change="change" />
    </n-gi>
  </n-grid>
  <div v-else>
    <n-scrollbar style="height: calc(50vh - 50px)">
      <component :is="Mds[step - 1]"></component>
    </n-scrollbar>
    <n-space justify="space-around">
      <n-button v-if="step !== 1" text type="primary" @click="prev">
        上一步
      </n-button>
      <n-button v-if="step !== TOTAL" text type="primary" @click="next">
        下一步
      </n-button>
    </n-space>
    <div class="relative">
      <n-button type="primary" class="action" @click="run">运行</n-button>
      <Monaco :value="code" @change="change" height="calc(50vh - 55px)" />
    </div>
  </div>
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

.relative {
  position: relative;
}

.action {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}
</style>

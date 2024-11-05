<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { useLearnStore } from "./store"

const CodeEditor = defineAsyncComponent(
  () => import("~/shared/components/CodeEditor.vue"),
)

const route = useRoute()
const learnStore = useLearnStore()

const content = shallowRef()

async function init() {
  content.value = defineAsyncComponent(
    () => import(`./${learnStore.dirname}/index.md`),
  )
  learnStore.currentTitle = learnStore.menu[learnStore.current - 1]
    .label as string

  try {
    const raw = await import(`./${learnStore.dirname}/main.py?raw`)
    learnStore.code = raw.default
    learnStore.showCode = true
  } catch (err) {
    learnStore.code = ""
    learnStore.showCode = false
  }
}

watch(
  () => route.params.step,
  async () => {
    if (route.name !== "learn") return
    init()
  },
  { immediate: true },
)
</script>

<template>
  <n-grid :cols="2" :x-gap="24">
    <n-gi :span="1">
      <n-flex vertical>
        <n-flex align="center">
          <n-button
            text
            :disabled="learnStore.current == 1"
            @click="learnStore.prev"
          >
            <Icon :width="30" icon="pepicons-pencil:arrow-left"></Icon>
          </n-button>
          <n-dropdown size="large" :options="learnStore.menu" trigger="click">
            <n-button tertiary style="flex: 1" size="large">
              <n-flex align="center">
                <span style="font-weight: bold">
                  {{ learnStore.currentTitle }}
                </span>
                <Icon :width="24" icon="proicons:chevron-down"></Icon>
              </n-flex>
            </n-button>
          </n-dropdown>
          <n-button
            text
            :disabled="learnStore.current == learnStore.total"
            @click="learnStore.next"
          >
            <Icon :width="30" icon="pepicons-pencil:arrow-right"></Icon>
          </n-button>
        </n-flex>
        <n-flex vertical size="large">
          <Component :is="content"></Component>
          <n-flex justify="space-between">
            <div style="flex: 1">
              <n-button
                block
                style="height: 60px"
                v-if="learnStore.current !== 1"
                @click="learnStore.prev"
              >
                上一课时
              </n-button>
            </div>
            <div style="flex: 1">
              <n-button
                block
                style="height: 60px"
                v-if="learnStore.current !== learnStore.total"
                @click="learnStore.next"
              >
                下一课时
              </n-button>
            </div>
          </n-flex>
        </n-flex>
      </n-flex>
    </n-gi>
    <n-gi :span="1">
      <n-flex vertical>
        <CodeEditor
          v-show="learnStore.showCode"
          language="Python3"
          v-model="learnStore.code"
        />
      </n-flex>
    </n-gi>
  </n-grid>
</template>

<style>
html.dark .shiki,
html.dark .shiki span {
  color: var(--shiki-dark) !important;
  background-color: var(--shiki-dark-bg) !important;
}

.markdown-body code {
  font-size: 20px;
  font-family: "Monaco";
}

.markdown-body h2 {
  font-size: 24px;
}

.markdown-body h3 {
  font-size: 22px;
}

.markdown-body p {
  font-size: 18px;
}

.markdown-body img {
  max-width: 100%;
}
</style>

<template>
  <n-grid :cols="2" :x-gap="24" v-if="!!tutorial.id">
    <n-gi :span="1">
      <n-flex vertical>
        <n-flex align="center">
          <n-button text :disabled="step == 1" @click="prev">
            <Icon :width="30" icon="pepicons-pencil:arrow-left"></Icon>
          </n-button>
          <n-dropdown size="large" :options="menu" trigger="click">
            <n-button tertiary style="flex: 1" size="large">
              <n-flex align="center">
                <span style="font-weight: bold">
                  {{ title }}
                </span>
                <Icon :width="24" icon="proicons:chevron-down"></Icon>
              </n-flex>
            </n-button>
          </n-dropdown>
          <n-button text :disabled="step == titles.length" @click="next">
            <Icon :width="30" icon="pepicons-pencil:arrow-right"></Icon>
          </n-button>
        </n-flex>
        <n-flex vertical size="large">
          <MdPreview
            preview-theme="vuepress"
            :theme="isDark ? 'dark' : 'light'"
            :model-value="tutorial.content"
          />
          <n-flex justify="space-between">
            <div style="flex: 1">
              <n-button
                block
                style="height: 40px"
                v-if="step !== 1"
                @click="prev"
              >
                上一课时
              </n-button>
            </div>
            <div style="flex: 1">
              <n-button
                block
                style="height: 40px"
                v-if="step !== titles.length"
                @click="next"
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
          v-show="!!tutorial.code"
          language="Python3"
          v-model="tutorial.code"
        />
      </n-flex>
    </n-gi>
  </n-grid>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue"

import { MdPreview } from "md-editor-v3"
import "md-editor-v3/lib/preview.css"
import { Tutorial } from "utils/types"
import { getTutorial, getTutorials } from "../api"

const CodeEditor = defineAsyncComponent(
  () => import("shared/components/CodeEditor.vue"),
)

const isDark = useDark()
const route = useRoute()
const router = useRouter()

const step = computed(() => {
  if (!route.params.step || !route.params.step.length) return 1
  else {
    return parseInt(route.params.step[0])
  }
})

const tutorial = ref<Partial<Tutorial>>({
  id: 0,
  title: "",
  content: "",
  code: "",
})

const titles = ref<{ id: number; title: string }[]>([])
const title = computed(
  () => `第 ${step.value} 课：${titles.value[step.value - 1].title}`,
)

const menu = computed<DropdownOption[]>(() => {
  return titles.value.map((item, index) => {
    const id = (index + 1).toString().padStart(2, "0")
    const prefix = `第 ${index + 1} 课：`
    return {
      key: id,
      label: prefix + item.title,
      props: {
        onClick: () => router.push(`/learn/${id}`),
      },
    }
  })
})

async function init() {
  const res1 = await getTutorials()
  titles.value = res1.data
  if (titles.value.length === 0) return
  const id = titles.value[step.value - 1].id
  const res2 = await getTutorial(id)
  tutorial.value = res2.data
}

function next() {
  if (step.value === titles.value.length) return
  const dest = (step.value + 1).toString().padStart(2, "0")
  router.push("/learn/" + dest)
}

function prev() {
  if (step.value === 1) return
  const dest = (step.value - 1).toString().padStart(2, "0")
  router.push("/learn/" + dest)
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

<style>
.md-editor-preview .md-editor-code .md-editor-code-head {
  z-index: 100;
}
</style>

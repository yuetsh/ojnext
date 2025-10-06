<template>
  <n-grid :cols="5" :x-gap="16" v-if="tutorial.id">
    <n-gi :span="1">
      <n-card title="目录" :bordered="false" size="small">
        <n-scrollbar :style="{ maxHeight: 'calc(100vh - 180px)' }">
          <n-list hoverable clickable>
            <n-list-item
              v-for="(item, index) in titles"
              :key="item.id"
              @click="goToLesson(index + 1)"
            >
              <n-text
                :type="step === index + 1 ? 'primary' : undefined"
                :strong="step === index + 1"
              >
                {{ index + 1 }}. {{ item.title }}
              </n-text>
            </n-list-item>
          </n-list>
        </n-scrollbar>
      </n-card>
    </n-gi>

    <n-gi :span="tutorial.code ? 2 : 4">
      <n-card
        :title="`第 ${step} 课：${titles[step - 1]?.title}`"
        :bordered="false"
        size="small"
      >
        <MdPreview
          preview-theme="vuepress"
          :theme="isDark ? 'dark' : 'light'"
          :model-value="tutorial.content"
        />
      </n-card>
    </n-gi>

    <n-gi :span="2" v-if="tutorial.code">
      <n-card title="示例代码" :bordered="false" size="small">
        <CodeEditor language="Python3" v-model="tutorial.code" />
      </n-card>
    </n-gi>
  </n-grid>
</template>

<script setup lang="ts">
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

function goToLesson(lessonNumber: number) {
  const dest = lessonNumber.toString().padStart(2, "0")
  router.push("/learn/" + dest)
}

async function init() {
  const res1 = await getTutorials()
  titles.value = res1.data
  if (titles.value.length === 0) return
  const id = titles.value[step.value - 1].id
  const res2 = await getTutorial(id)
  tutorial.value = res2.data
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

<style scoped>
:deep(.md-editor-preview .md-editor-code .md-editor-code-head) {
  z-index: 100;
}
</style>

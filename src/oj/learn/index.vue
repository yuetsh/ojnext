<template>
  <div>
    <!-- 桌面端布局 -->
    <n-grid :cols="5" :x-gap="16" v-if="tutorial.id && isDesktop">
      <n-gi :span="1">
        <n-card title="教程目录" :bordered="false" size="small">
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

    <!-- 手机端布局 -->
    <template v-if="tutorial.id && !isDesktop">
      <n-tabs type="line" animated v-model:value="activeTab">
        <n-tab-pane name="catalog" tab="目录">
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
        </n-tab-pane>

        <n-tab-pane name="content" :tab="`第 ${step} 课`">
          <MdPreview
            preview-theme="vuepress"
            :theme="isDark ? 'dark' : 'light'"
            :model-value="tutorial.content"
          />
        </n-tab-pane>

        <n-tab-pane name="code" tab="示例代码" v-if="tutorial.code">
          <CodeEditor language="Python3" v-model="tutorial.code" />
        </n-tab-pane>
      </n-tabs>

      <n-divider style="margin: 12px 0" />

      <n-flex align="center" justify="space-between">
        <n-button
          secondary
          type="primary"
          :disabled="isFirstLesson"
          @click="goToPrevLesson"
        >
          ← 上一课
        </n-button>
        <n-text>{{ step }} / {{ titles.length }}</n-text>
        <n-button
          secondary
          type="primary"
          :disabled="isLastLesson"
          @click="goToNextLesson"
        >
          下一课 →
        </n-button>
      </n-flex>
    </template>
  </div>
</template>

<script setup lang="ts">
import { MdPreview } from "md-editor-v3"
import "md-editor-v3/lib/preview.css"
import { Tutorial } from "utils/types"
import { getTutorial, getTutorials } from "../api"
import { useBreakpoints } from "shared/composables/breakpoints"
const isDark = useDark()

const CodeEditor = defineAsyncComponent(
  () => import("shared/components/CodeEditor.vue"),
)

const route = useRoute()
const router = useRouter()

const { isDesktop } = useBreakpoints()

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
const activeTab = ref("content")

const isFirstLesson = computed(() => step.value === 1)
const isLastLesson = computed(() => step.value === titles.value.length)

function goToLesson(lessonNumber: number) {
  activeTab.value = "content"
  const dest = lessonNumber.toString().padStart(2, "0")
  router.push("/learn/" + dest)
}

function goToPrevLesson() {
  if (step.value > 1) {
    goToLesson(step.value - 1)
  }
}

function goToNextLesson() {
  if (step.value < titles.value.length) {
    goToLesson(step.value + 1)
  }
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

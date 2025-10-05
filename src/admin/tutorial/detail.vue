<script lang="ts" setup>
import CodeEditor from "shared/components/CodeEditor.vue"
import MarkdownEditor from "shared/components/MarkdownEditor.vue"
import { Tutorial } from "utils/types"
import { createTutorial, getTutorial, updateTutorial } from "../api"

interface Props {
  tutorialID?: string
}

const route = useRoute()
const router = useRouter()
const message = useMessage()
const props = defineProps<Props>()

const tutorial = reactive<Tutorial>({
  id: 0,
  title: "",
  content: "",
  code: "",
  is_public: false,
  order: 0,
  type: "python", // 默认选择 Python
})

const typeOptions = [
  { label: "Python", value: "python" },
  { label: "C 语言", value: "c" },
]

async function init() {
  if (!props.tutorialID) {
    return
  }
  const id = parseInt(route.params.tutorialID as string)
  const data = await getTutorial(id)
  tutorial.id = data.id
  tutorial.title = data.title
  tutorial.content = data.content
  tutorial.code = data.code || ""
  tutorial.is_public = data.is_public
  tutorial.order = data.order
  tutorial.type = data.type || "python"
}

async function submit() {
  if (!tutorial.title || !tutorial.content) {
    message.error("标题和正文必填")
    return
  }
  try {
    if (route.name === "admin tutorial create") {
      await createTutorial({
        title: tutorial.title,
        content: tutorial.content,
        code: tutorial.code,
        is_public: tutorial.is_public,
        order: tutorial.order,
        type: tutorial.type,
      })
      message.success("成功新建教程 💐")
    } else {
      await updateTutorial(tutorial)
      message.success("修改已保存")
    }
    router.push({ name: "admin tutorial list" })
  } catch (err: any) {
    message.error(err.data)
  }
}

onMounted(init)
</script>
<template>
  <h2 class="title">
    {{ route.name === "admin tutorial create" ? "新建教程" : "编辑教程" }}
  </h2>
  <n-form inline>
    <n-form-item label="标题">
      <n-input class="contestTitle" v-model:value="tutorial.title" />
    </n-form-item>
    <n-form-item label="语言">
      <n-select
        v-model:value="tutorial.type"
        :options="typeOptions"
        class="select"
      />
    </n-form-item>
    <n-form-item label="顺序">
      <n-input-number
        style="width: 100px"
        v-model:value="tutorial.order"
        :min="0"
      />
    </n-form-item>
    <n-form-item label="可见">
      <n-switch v-model:value="tutorial.is_public" />
    </n-form-item>
    <n-form-item>
      <n-button type="primary" @click="submit">保存</n-button>
    </n-form-item>
  </n-form>

  <n-tabs type="line" animated>
    <n-tab-pane name="content" tab="教程内容">
      <MarkdownEditor v-model:value="tutorial.content" />
    </n-tab-pane>
    <n-tab-pane name="code" tab="示例代码">
      <CodeEditor
        v-model:value="tutorial.code"
        :language="tutorial.type === 'python' ? 'Python3' : 'C'"
        height="400px"
      />
    </n-tab-pane>
  </n-tabs>
</template>
<style scoped>
.title {
  margin-top: 0;
}

.select {
  width: 100px;
}

.contestTitle {
  width: 400px;
}
</style>

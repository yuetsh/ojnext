<script setup lang="ts">
import "@wangeditor/editor/dist/css/style.css"
import { IDomEditor, IEditorConfig, IToolbarConfig } from "@wangeditor/editor"
import { Editor, Toolbar } from "@wangeditor/editor-for-vue"
import { uploadImage } from "../admin/api"

interface Props {
  value: string
  title: string
  minHeight?: number
}

type InsertFnType = (url: string, alt: string, href: string) => void

const props = withDefaults(defineProps<Props>(), {
  minHeight: 0,
})
const emit = defineEmits(["update:value"])

const message = useMessage()
const rawHtml = ref(props.value)
watch(rawHtml, () => emit("update:value", rawHtml.value))

const editorRef = shallowRef<IDomEditor>()

const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys: ["todo", "insertVideo", "insertTable", "fullScreen"],
}

const editorConfig: Partial<IEditorConfig> = {
  scroll: false,
  MENU_CONF: {
    uploadImage: { customUpload },
  },
}

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor) editor.destroy()
})

function handleCreated(editor: IDomEditor) {
  editorRef.value = editor
}

async function customUpload(file: File, insertFn: InsertFnType) {
  const path = await uploadImage(file)
  if (!path) {
    message.error("图片上传失败")
    return
  }
  const url = path
  const alt = "图片"
  const href = ""
  insertFn(url, alt, href)
}
</script>

<template>
  <div class="title" v-if="props.title">{{ props.title }}</div>
  <div class="editorWrapper">
    <Toolbar
      class="toolbar"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      mode="simple"
    />
    <Editor
      :style="{ minHeight: props.minHeight + 'px' }"
      v-model="rawHtml"
      :defaultConfig="editorConfig"
      mode="simple"
      @onCreated="handleCreated"
    />
  </div>
</template>

<style scoped>
.title {
  margin-bottom: 12px;
}

.toolbar {
  border-bottom: 1px solid #ddd;
}

.editorWrapper {
  border: 1px solid #ddd;
  margin-bottom: 20px;
}
</style>

<script setup lang="ts">
import { IDomEditor, IEditorConfig, IToolbarConfig } from "@wangeditor/editor"
import { Editor, Toolbar } from "@wangeditor/editor-for-vue"
import "@wangeditor/editor/dist/css/style.css"
import { uploadImage } from "../../admin/api"

interface Props {
  title: string
  simple?: boolean
  minHeight?: number
}

const rawHtml = defineModel<string>("value")
type InsertFnType = (url: string, alt: string, href: string) => void

const props = withDefaults(defineProps<Props>(), {
  minHeight: 0,
  simple: false,
})

const message = useMessage()

const editorRef = shallowRef<IDomEditor>()

const toolbarConfig: Partial<IToolbarConfig> = {
  toolbarKeys: [
    "blockquote",
    "headerSelect",
    "fontSize",
    "lineHeight",
    "|",
    "bold",
    "underline",
    "italic",
    "through",
    "color",
    "bgColor",
    "|",
    "bulletedList",
    "numberedList",
    "justifyLeft",
    "justifyCenter",
    "justifyRight",
    "|",
    "uploadImage",
    "emotion",
    "insertLink",
    "insertTable",
    "divider",
    "|",
    "clearStyle",
    "undo",
    "redo",
  ],
}

const toolbarConfigSimple: Partial<IToolbarConfig> = {
  toolbarKeys: [
    "bold",
    "color",
    "bgColor",
    "emotion",
    "uploadImage",
    "insertLink",
    "clearStyle",
    "undo",
    "redo",
  ],
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

function onClick() {
  if (!editorRef.value) return
  editorRef.value.blur()
  editorRef.value.focus()
}

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
      :defaultConfig="props.simple ? toolbarConfigSimple : toolbarConfig"
      mode="simple"
    />
    <Editor
      @click="onClick"
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

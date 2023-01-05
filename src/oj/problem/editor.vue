<script lang="ts" setup>
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker"
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker"
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker"
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker"
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker"

import * as monaco from "monaco-editor"
import {
  nextTick,
  ref,
  onBeforeUnmount,
  onMounted,
  watch,
  defineProps,
} from "vue"

const props = defineProps(["value", "language"])

const value = ref(props.value || "")
const language = ref(props.language || "C")

const monacoEditorRef = ref()

// @ts-ignore
self.MonacoEnvironment = {
  getWorker(workerId: string, label: string) {
    if (label === "json") {
      return new jsonWorker()
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker()
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker()
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker()
    }
    return new editorWorker()
  },
}

function reset() {
  if (editor) {
    editor.getModel()!.setValue(props.value || "")
  }
}

onBeforeUnmount(() => {
  editor && editor.dispose()
})

onMounted(() => {
  editorInit()
})

watch(language, () => {
  if (editor) {
    monaco.editor.setModelLanguage(
      editor.getModel()!,
      language.value.toLowerCase()
    )
  }
})

let editor: monaco.editor.IStandaloneCodeEditor

function editorInit() {
  nextTick(() => {
    if (editor) {
      editor.setValue("")
    } else {
      editor = monaco.editor.create(monacoEditorRef.value, {
        value: value.value, // 编辑器初始显示文字
        language: language.value.toLowerCase(),
        automaticLayout: true, // 自适应布局
        theme: "vs", // 官方自带三种主题vs, hc-black, or vs-dark
        minimap: {
          enabled: false,
        },
        fontSize: 24, // 字体大小
        scrollBeyondLastLine: false, // 取消代码后面一大段空白
        overviewRulerBorder: false, // 不要滚动条的边框
      })
    }
    // 监听值的变化
    editor.onDidChangeModelContent(() => {
      value.value = editor.getValue()
    })
  })
}
</script>

<template>
  <el-form :inline="true">
    <el-form-item label="语言" label-width="60">
      <el-select class="language" v-model="language">
        <el-option value="C">C</el-option>
        <el-option value="Python">Python</el-option>
        <el-option value="CPP">C++</el-option>
        <el-option value="Java">Java</el-option>
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button @click="reset">重置</el-button>
    </el-form-item>
  </el-form>
  <div ref="monacoEditorRef" class="editor"></div>
  <el-tabs type="border-card">
    <el-tab-pane label="测试用例"> 1 </el-tab-pane>
    <el-tab-pane label="执行结果"> 2 </el-tab-pane>
  </el-tabs>
  <el-form class="actions">
    <el-form-item>
      <el-button>运行</el-button>
      <el-button type="primary">提交</el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.language {
  width: 100px;
}

.editor {
  height: 500px;
}
.actions {
  margin-top: 16px;
  float: right;
}
</style>

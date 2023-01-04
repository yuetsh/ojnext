<template>
  <el-select v-model="language">
    <el-option value="c">C</el-option>
    <el-option value="python">Python</el-option>
  </el-select>
  <div ref="monacoEditorRef" style="height: 300px"></div>
</template>
<script lang="ts" setup>
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker"
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker"
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker"
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker"
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker"

import * as monaco from "monaco-editor"
import { nextTick, ref, onBeforeUnmount, onMounted } from "vue"

const text = ref("")
const monacoEditorRef = ref()
const language = ref("C")

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

onBeforeUnmount(() => {
  editor.dispose()
})

onMounted(() => {
  editorInit()
})

let editor: monaco.editor.IStandaloneCodeEditor

function editorInit() {
  nextTick(() => {
    !editor
      ? (editor = monaco.editor.create(monacoEditorRef.value, {
          value: text.value, // 编辑器初始显示文字
          language: "python", // 语言支持自行查阅demo
          automaticLayout: true, // 自适应布局
          theme: "vs", // 官方自带三种主题vs, hc-black, or vs-dark
          foldingStrategy: "indentation",
          renderLineHighlight: "all", // 行亮
          selectOnLineNumbers: true, // 显示行号
          minimap: {
            enabled: false,
          },
          readOnly: false, // 只读
          fontSize: 16, // 字体大小
          scrollBeyondLastLine: false, // 取消代码后面一大段空白
          overviewRulerBorder: false, // 不要滚动条的边框
        }))
      : editor.setValue("")
    // 监听值的变化
    editor.onDidChangeModelContent(() => {
      text.value = editor.getValue()
    })
  })
}
</script>
<style scoped></style>

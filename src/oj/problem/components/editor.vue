<script lang="ts" setup>
import loader, { Monaco } from "@monaco-editor/loader"
import { ref, onBeforeUnmount, onMounted, watch, reactive } from "vue"
import { onBeforeRouteLeave, useRoute } from "vue-router"
import {
  buildProblemCodeKey,
  LANGUAGE,
  languageLabel,
  languageValue,
} from "../../../utils/constants"
import storage from "../../../utils/storage"

const route = useRoute()
const { languages, template } = defineProps<{
  languages: Array<LANGUAGE>
  template: { [key in LANGUAGE]?: string }
}>()

const state = reactive({
  value: "",
  language: languages[0] || "C",
  theme: "vs",
})

const monacoEditorRef = ref()

let monaco: Monaco

function reset() {
  if (monaco && monaco.editor) {
    monaco.editor.getModels()[0].setValue(template[state.language] || "")
  }
}

onMounted(() => {
  initValue()
  initEditor()
})

onBeforeUnmount(() => {
  monaco.editor.getModels().forEach((model) => model.dispose())
})

onBeforeRouteLeave(() => {
  const key = buildProblemCodeKey(
    route.params.problemID as string,
    route.params.contestID as string
  )
  storage.set(key, {
    code: state.value,
    language: state.language,
    theme: state.theme,
  })
})

watch(
  () => state.language,
  () => {
    if (monaco && monaco.editor) {
      monaco.editor.setModelLanguage(
        monaco.editor.getModels()[0],
        languageValue[state.language]
      )
    }
  }
)

function initValue() {
  const key = buildProblemCodeKey(
    route.params.problemID as string,
    route.params.contestID as string
  )
  const problemCode = storage.get(key)
  if (problemCode) {
    state.value = problemCode.code
    state.language = problemCode.language
    state.theme = problemCode.theme
  }
  if (!state.value && template[state.language]) {
    state.value = template[state.language] || ""
  }
}

async function initEditor() {
  monaco = await loader.init()
  monaco.editor.create(monacoEditorRef.value, {
    value: state.value, // 编辑器初始显示文字
    language: languageValue[state.language],
    automaticLayout: true, // 自适应布局
    theme: state.theme, // 官方自带三种主题vs, hc-black, or vs-dark
    minimap: {
      enabled: false,
    },
    fontSize: 24, // 字体大小
    scrollBeyondLastLine: false, // 取消代码后面一大段空白
    overviewRulerBorder: false, // 不要滚动条的边框
  })
  // 监听值的变化
  monaco.editor.getModels()[0].onDidChangeContent(() => {
    console.log(1)
    state.value = monaco.editor.getModels()[0].getValue()
  })
}
</script>

<template>
  <el-form :inline="true">
    <el-form-item label="语言" label-width="60">
      <el-select v-model="state.language" class="language">
        <el-option
          v-for="item in languages"
          :key="item"
          :value="item"
          :label="languageLabel[item]"
        >
        </el-option>
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

<script lang="ts" setup>
import loader, { Monaco } from "@monaco-editor/loader"
import {
  LANGUAGE_LABEL,
  LANGUAGE_VALUE,
  SOURCES,
} from "../../../utils/constants"
import { isMobile } from "../../../utils/breakpoints"
import { Problem } from "../../../utils/types"
import EditorExec from "./editor-exec.vue"

interface Props {
  problem: Problem
}

const props = defineProps<Props>()
const code = reactive({
  value: SOURCES[props.problem.languages[0] || "C"],
  language: props.problem.languages[0] || "C",
})
provide("code", code)

const monacoEditorRef = ref()

let monaco: Monaco

onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  monaco.editor.getModels().forEach((model) => model.dispose())
})

watch(
  () => code.language,
  () => {
    if (monaco && monaco.editor) {
      monaco.editor.setModelLanguage(
        monaco.editor.getModels()[0],
        LANGUAGE_VALUE[code.language]
      )
      reset()
    }
  }
)

function reset() {
  code.value = props.problem.template[code.language] || SOURCES[code.language]
  if (monaco && monaco.editor) {
    monaco.editor.getModels()[0].setValue(code.value)
  }
}

async function init() {
  code.value = props.problem.template[code.language] || SOURCES[code.language]
  monaco = await loader.init()
  monaco.editor.create(monacoEditorRef.value, {
    value: code.value, // 编辑器初始显示文字
    language: LANGUAGE_VALUE[code.language],
    theme: "vs-dark", // 官方自带三种主题vs, hc-black, or vs-dark
    minimap: {
      enabled: false,
    },
    lineNumbersMinChars: 3,
    automaticLayout: true, // 自适应布局
    tabSize: 4,
    fontSize: isMobile.value ? 20 : 24, // 字体大小
    scrollBeyondLastLine: false, // 取消代码后面一大段空白
  })
  monaco.editor.getModels()[0].onDidChangeContent(() => {
    code.value = monaco.editor.getModels()[0].getValue()
  })
}
</script>

<template>
  <el-form inline>
    <el-form-item label="语言" label-width="60">
      <el-select v-model="code.language" class="language">
        <el-option
          v-for="item in problem.languages"
          :key="item"
          :value="item"
          :label="LANGUAGE_LABEL[item]"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button @click="reset">重置</el-button>
    </el-form-item>
  </el-form>
  <section
    ref="monacoEditorRef"
    :class="isMobile ? 'editorMobile' : 'editor'"
  ></section>
  <EditorExec />
</template>

<style scoped>
.language {
  width: 100px;
}

.editor {
  /* 141px+400 */
  height: calc(100vh - 541px);
}

.editorMobile {
  height: 500px;
}
</style>

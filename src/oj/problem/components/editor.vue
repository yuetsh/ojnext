<script lang="ts" setup>
import loader, { Monaco } from "@monaco-editor/loader"
import { ref, onBeforeUnmount, onMounted, watch, reactive } from "vue"
import {
  LANGUAGE_LABEL,
  LANGUAGE_VALUE,
  SOURCES,
} from "../../../utils/constants"
import { isMobile } from "../../../utils/breakpoints"
import { Problem } from "../../../utils/types"
import EditorExec from "./editor-exec.vue"

const { problem } = defineProps<{ problem: Problem }>()
const state = reactive({
  code: SOURCES[problem.languages[0] || "C"],
  language: problem.languages[0] || "C",
  isMobile,
})
const monacoEditorRef = ref()

let monaco: Monaco

onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  monaco.editor.getModels().forEach((model) => model.dispose())
})

watch(
  () => state.language,
  () => {
    if (monaco && monaco.editor) {
      monaco.editor.setModelLanguage(
        monaco.editor.getModels()[0],
        LANGUAGE_VALUE[state.language]
      )
      reset()
    }
  }
)

function reset() {
  state.code = problem.template[state.language] || SOURCES[state.language]
  if (monaco && monaco.editor) {
    monaco.editor.getModels()[0].setValue(state.code)
  }
}

async function init() {
  state.code = problem.template[state.language] || SOURCES[state.language]
  monaco = await loader.init()
  monaco.editor.create(monacoEditorRef.value, {
    value: state.code, // 编辑器初始显示文字
    language: LANGUAGE_VALUE[state.language],
    theme: "vs", // 官方自带三种主题vs, hc-black, or vs-dark
    minimap: {
      enabled: false,
    },
    lineNumbersMinChars: 3,
    automaticLayout: true, // 自适应布局
    tabSize: 4,
    fontSize: state.isMobile ? 20 : 24, // 字体大小
    scrollBeyondLastLine: false, // 取消代码后面一大段空白
  })
  monaco.editor.getModels()[0].onDidChangeContent(() => {
    state.code = monaco.editor.getModels()[0].getValue()
  })
}
</script>

<template>
  <el-form inline>
    <el-form-item label="语言" label-width="60">
      <el-select v-model="state.language" class="language">
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
  <EditorExec :state="state" :problem="problem" />
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

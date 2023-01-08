<script lang="ts" setup>
import loader, { Monaco } from "@monaco-editor/loader"
import { ref, onBeforeUnmount, onMounted, watch, reactive, computed } from "vue"
import {
  LANGUAGE_LABEL,
  LANGUAGE_VALUE,
  SOURCES,
} from "../../../utils/constants"
import { isMobile } from "../../../utils/breakpoints"
import { submitCode } from "../../api"
import { Problem } from "../../../utils/types"

const { problem, contestID = "" } = defineProps<{
  contestID?: string
  problemID?: string
  problem: Problem
}>()
const state = reactive({
  values: ref({ ...SOURCES }),
  language: problem.languages[0] || "C",
  isMobile,
  submissionId: "",
})

const monacoEditorRef = ref()
let monaco: Monaco

function reset() {
  state.values[state.language] =
    problem.template[state.language] || SOURCES[state.language]
  if (monaco && monaco.editor) {
    monaco.editor.getModels()[0].setValue(state.values[state.language])
  }
}

onMounted(init)

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

async function init() {
  state.values[state.language] =
    problem.template[state.language] || SOURCES[state.language]

  monaco = await loader.init()
  monaco.editor.create(monacoEditorRef.value, {
    value: state.values[state.language], // 编辑器初始显示文字
    language: LANGUAGE_VALUE[state.language],
    theme: "vs", // 官方自带三种主题vs, hc-black, or vs-dark
    minimap: {
      enabled: false,
    },
    lineNumbersMinChars: 3,
    automaticLayout: true, // 自适应布局
    tabSize: 4,
    fontSize: state.isMobile ? 16 : 24, // 字体大小
    scrollBeyondLastLine: false, // 取消代码后面一大段空白
  })
  monaco.editor.getModels()[0].onDidChangeContent(() => {
    state.values[state.language] = monaco.editor.getModels()[0].getValue()
  })
}

const submitDisabled = computed(() => {
  const code = state.values[state.language]
  return (
    code.trim() === "" ||
    code === problem.template[state.language] ||
    code === SOURCES[state.language]
  )
})

async function submit() {
  const data = {
    problem_id: problem.id,
    language: state.language,
    code: state.values[state.language],
  }
  if (contestID) {
    //@ts-ignore
    data.contest_id = parseInt(contestID)
  }
  const res = await submitCode(data)
  state.submissionId = res.data.submission_id
}
</script>

<template>
  <el-form :inline="true">
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
  <div
    ref="monacoEditorRef"
    :class="isMobile ? 'editorMobile' : 'editor'"
  ></div>
  <el-tabs type="border-card">
    <el-tab-pane label="测试用例"> 1 </el-tab-pane>
    <el-tab-pane label="执行结果"> 2 </el-tab-pane>
  </el-tabs>
  <el-form class="actions">
    <el-form-item>
      <el-button>运行</el-button>
      <el-button type="primary" :disabled="submitDisabled" @click="submit">
        提交
      </el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.language {
  width: 100px;
}

.editor {
  height: 70%;
}

.editorMobile {
  height: 500px;
}

.actions {
  margin-top: 16px;
  float: right;
}
</style>

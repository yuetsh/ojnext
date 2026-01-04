<script setup lang="ts">
import { getProblemTagList } from "shared/api"
import TextEditor from "shared/components/TextEditor.vue"
import {
  CODE_TEMPLATES,
  LANGUAGE_SHOW_VALUE,
  STORAGE_KEY,
} from "utils/constants"
import download from "utils/download"
import { unique } from "utils/functions"
import { BlankProblem, LANGUAGE, Tag, Testcase } from "utils/types"
import {
  createContestProblem,
  createProblem,
  editContestProblem,
  editProblem,
  getProblem,
  uploadTestcases,
} from "../api"

const CodeEditor = defineAsyncComponent(
  () => import("shared/components/CodeEditor.vue"),
)

const MermaidEditor = defineAsyncComponent(
  () => import("shared/components/MermaidEditor.vue"),
)

interface Props {
  problemID?: string
  contestID?: string
}

const message = useMessage()
const route = useRoute()
const router = useRouter()
const props = defineProps<Props>()

const title = computed(
  () =>
    ({
      "admin problem create": "新建题目",
      "admin problem edit": "编辑题目",
      "admin contest problem create": "新建比赛题目",
      "admin contest problem edit": "编辑比赛题目",
    })[<string>route.name],
)

const problem = useLocalStorage<BlankProblem>(STORAGE_KEY.ADMIN_PROBLEM, {
  _id: "",
  title: "",
  description: "",
  input_description: "",
  output_description: "",
  time_limit: 1000,
  memory_limit: 64,
  difficulty: "Low" as "Low" | "Mid" | "High",
  visible: false,
  share_submission: false,
  tags: [],
  languages: ["Python3", "C"] as LANGUAGE[],
  template: {} as { [key in LANGUAGE]?: string },
  samples: [
    { input: "", output: "" },
    { input: "", output: "" },
    { input: "", output: "" },
  ],
  test_case_id: "",
  test_case_score: [] as Testcase[],
  rule_type: "ACM",
  hint: "",
  source: "",
  prompt: "",
  answers: [] as { language: LANGUAGE; code: string }[],
  io_mode: {
    io_mode: "Standard IO",
    input: "input.txt",
    output: "output.txt",
  },
  contest_id: "",
  allow_flowchart: false,
  mermaid_code: "",
  flowchart_data: {},
  flowchart_hint: "",
  show_flowchart: false,
})

// 从服务器来的tag列表
const tagList = shallowRef<Tag[]>([])

interface Tags {
  select: string[]
  upload: string[]
}
// 从 tagList 中选择的 和 新上传的
const tags = useLocalStorage<Tags>(STORAGE_KEY.ADMIN_PROBLEM_TAGS, {
  select: [],
  upload: [],
})

// 这几个用的少，就不缓存本地了
const [needTemplate, toggleNeedTemplate] = useToggle(false)
const template = reactive(JSON.parse(JSON.stringify(CODE_TEMPLATES)))
const currentActiveTemplate = ref<LANGUAGE>("Python3")
const currentActiveAnswer = ref<LANGUAGE>("Python3")

// 给 TextEditor 用
const [ready, toggleReady] = useToggle(false)

// Mermaid 渲染状态
const mermaidRenderSuccess = ref(false)

const difficultyOptions: SelectOption[] = [
  { label: "简单", value: "Low" },
  { label: "中等", value: "Mid" },
  { label: "困难", value: "High" },
]

const languageOptions = [
  { label: LANGUAGE_SHOW_VALUE["Python3"], value: "Python3" },
  { label: LANGUAGE_SHOW_VALUE["C"], value: "C" },
  { label: LANGUAGE_SHOW_VALUE["C++"], value: "C++" },
]

const tagOptions = computed(() =>
  tagList.value.map((tag) => ({ label: tag.name, value: tag.name })),
)

async function getProblemDetail() {
  if (!props.problemID) {
    toggleReady(true)
    return
  }
  try {
    const { data } = await getProblem(props.problemID)
    toggleReady(true)
    problem.value.id = data.id
    problem.value._id = data._id
    problem.value.title = data.title
    problem.value.description = data.description
    problem.value.input_description = data.input_description
    problem.value.output_description = data.output_description
    problem.value.time_limit = data.time_limit
    problem.value.memory_limit = data.memory_limit
    problem.value.memory_limit = data.memory_limit
    problem.value.difficulty = data.difficulty
    problem.value.visible = data.visible
    problem.value.share_submission = data.share_submission
    problem.value.tags = data.tags
    problem.value.languages = data.languages
    problem.value.template = data.template
    problem.value.samples = data.samples
    problem.value.samples = data.samples
    problem.value.test_case_id = data.test_case_id
    problem.value.test_case_score = data.test_case_score
    problem.value.rule_type = data.rule_type
    problem.value.hint = data.hint
    problem.value.source = data.source
    problem.value.prompt = data.prompt
    // 流程图相关字段
    problem.value.allow_flowchart = data.allow_flowchart
    problem.value.show_flowchart = data.show_flowchart
    problem.value.mermaid_code = data.mermaid_code ?? ""
    problem.value.flowchart_hint = data.flowchart_hint ?? ""
    problem.value.flowchart_data = data.flowchart_data
    if (data.answers && data.answers.length) {
      problem.value.answers = data.answers
    } else {
      problem.value.answers = data.languages.map((lang: LANGUAGE) => ({
        language: lang,
        code: "",
      }))
    }
    problem.value.io_mode = data.io_mode
    if (problem.value.contest_id) {
      problem.value.contest_id = problem.value.contest_id
    }

    // 下面是用来显示的：
    // 代码模板 和 模板开关
    problem.value.languages.forEach((lang) => {
      if (data.template[lang]) {
        template[lang] = data.template[lang]
        toggleNeedTemplate(true)
      }
    })
    // 标签
    tags.value.select = data.tags
  } catch (error) {
    message.error("获取题目失败")
    router.push({ name: "admin problem list" })
  }
}

async function getTagList() {
  const res = await getProblemTagList()
  tagList.value = res.data
}

function updateNewTags(v: string[]) {
  const blanks = []
  const uniqueTags = unique(v)
  const items = tagList.value.map((t) => t.name)
  for (let i = 0; i < uniqueTags.length; i++) {
    const tag = uniqueTags[i]
    if (items.indexOf(tag) < 0) {
      blanks.push(tag)
    } else {
      message.error("已经存在标签：" + tag)
      break
    }
  }
  tags.value.upload = blanks
}

function addSample() {
  problem.value.samples.push({ input: "", output: "" })
}

function removeSample(index: number) {
  problem.value.samples.splice(index, 1)
}

function resetTemplate(language: LANGUAGE) {
  template[language] = CODE_TEMPLATES[language]
}

async function handleUploadTestcases({ file }: UploadCustomRequestOptions) {
  try {
    const res = await uploadTestcases(file.file!)
    // @ts-ignore
    if (res.error) {
      message.error("上传测试用例失败")
      return
    }
    const testcases = res.data.info
    for (let file of testcases) {
      file.score = (100 / testcases.length).toFixed(0)
    }
    problem.value.test_case_score = testcases
    problem.value.test_case_id = res.data.id
  } catch (err) {
    message.error("上传测试用例失败")
  }
}

function downloadTestcases() {
  download("test_case?problem_id=" + problem.value.id)
}

// Mermaid 渲染事件处理
function onMermaidRenderSuccess() {
  mermaidRenderSuccess.value = true
}

// 题目是否有漏写的
async function validateProblem() {
  let hasErrors = false
  // 标题
  if (!problem.value._id || !problem.value.title) {
    message.error("编号或标题没有填写")
    hasErrors = true
  }
  // 标签
  else if (tags.value.upload.length === 0 && tags.value.select.length === 0) {
    message.error("标签没有填写")
    hasErrors = true
  }
  // 题目
  else if (
    !problem.value.description ||
    !problem.value.input_description ||
    !problem.value.output_description
  ) {
    message.error("题目或输入或输出没有填写")
    hasErrors = true
  }
  // 样例
  else if (problem.value.samples.length == 0) {
    message.error("样例没有填写")
    hasErrors = true
  }
  // 样例是空的
  else if (
    problem.value.samples.some(
      (sample) => sample.output === "" || sample.input === "",
    )
  ) {
    message.error("空样例没有删干净")
    hasErrors = true
  }
  // 测试用例
  else if (problem.value.test_case_score.length === 0) {
    message.error("测试用例没有上传")
    hasErrors = true
  } else if (problem.value.languages.length === 0) {
    message.error("编程语言没有选择")
    hasErrors = true
  }
  // 流程图验证
  else if (problem.value.show_flowchart || problem.value.allow_flowchart) {
    if (
      !problem.value.mermaid_code ||
      problem.value.mermaid_code.trim() === ""
    ) {
      message.error("启用了流程图功能，但流程图代码为空")
      hasErrors = true
    } else if (!mermaidRenderSuccess.value) {
      message.error("Mermaid 代码尚未成功渲染，请检查代码语法")
      hasErrors = true
    }
  }
  // 通过了
  else {
    hasErrors = false
  }
  return hasErrors
}

function getTemplate() {
  if (!needTemplate.value) {
    problem.value.template = {}
  } else {
    problem.value.languages.forEach((lang) => {
      if (CODE_TEMPLATES[lang] !== template[lang]) {
        problem.value.template[lang] = template[lang]
      } else {
        delete problem.value.template[lang]
      }
    })
  }
}

function filterHint() {
  // 编辑器会自动添加一段 HTML
  if (problem.value.hint === "<p><br></p>") {
    problem.value.hint = ""
  }
}

function filterAnswers() {
  problem.value.answers = problem.value.answers.filter(
    (ans) => ans.code.trim() !== "",
  )
}

async function submit() {
  const hasValidationErrors = await validateProblem()
  if (hasValidationErrors) return
  filterHint()
  getTemplate()
  filterAnswers()
  const api = {
    "admin problem create": createProblem,
    "admin problem edit": editProblem,
    "admin contest problem create": createContestProblem,
    "admin contest problem edit": editContestProblem,
  }[<string>route.name]
  if (
    route.name === "admin contest problem create" ||
    route.name === "admin contest problem edit"
  ) {
    problem.value.contest_id = props.contestID
  }
  try {
    await api!(problem.value)
    problem.value = null
    tags.value = null
    if (
      route.name === "admin problem create" ||
      route.name === "admin contest problem create"
    ) {
      message.success("恭喜你 💐 出题成功")
    }
    if (
      route.name === "admin problem create" ||
      route.name === "admin problem edit"
    ) {
      router.push({ name: "admin problem list" })
    } else {
      router.push({
        name: "admin contest problem list",
        params: { contestID: props.contestID },
      })
    }
  } catch (err: any) {
    if (err.data === "Display ID already exists") {
      message.error("显示编号重复了，请换一个显示编号")
    } else {
      message.error(err.data)
    }
  }
}

const showClear = computed(
  () =>
    route.name === "admin problem create" ||
    route.name === "admin contest problem create",
)

function clear() {
  problem.value = null
  tags.value = null
  // 为了给所有状态初始化，刷新页面
  location.reload()
}

function generateMermaid() {
  message.info("还在开发中，敬请期待！")
}

onMounted(() => {
  getTagList()
  getProblemDetail()
})

watch(
  () => [tags.value.select, tags.value.upload],
  (tags) => {
    const uniqueTags = unique<string>(tags[0].concat(tags[1]))
    problem.value.tags = uniqueTags
  },
)
watch(
  () => problem.value.languages,
  (langs) => {
    const answers = langs.map((lang) => {
      const existing = problem.value.answers.find(
        (ans) => ans.language === lang,
      )
      return existing || { language: lang, code: "" }
    })
    problem.value.answers = answers
  },
  { immediate: true },
)
</script>

<template>
  <n-flex>
    <h2 class="title">{{ title }}</h2>
    <n-button v-if="showClear" @click="clear">清空缓存</n-button>
  </n-flex>
  <n-form inline label-placement="left">
    <n-form-item label="显示编号">
      <n-input class="w-100" v-model:value="problem._id" />
    </n-form-item>
    <n-form-item label="题目">
      <n-input class="problemTitleInput" v-model:value="problem.title" />
    </n-form-item>
    <n-form-item label="难度">
      <n-select
        class="w-100"
        :options="difficultyOptions"
        v-model:value="problem.difficulty"
      />
    </n-form-item>
    <n-form-item label="可见">
      <n-switch v-model:value="problem.visible" />
    </n-form-item>
  </n-form>
  <n-form inline label-placement="left">
    <n-form-item label="现成的标签">
      <n-select
        class="tag"
        multiple
        v-model:value="tags.select"
        :options="tagOptions"
      />
    </n-form-item>
    <n-form-item label="新增的标签">
      <n-dynamic-tags
        v-model:value="tags.upload"
        @update:value="updateNewTags"
      />
    </n-form-item>
  </n-form>
  <TextEditor
    v-if="ready"
    v-model:value="problem.description"
    title="题目的描述"
    :min-height="300"
  />
  <TextEditor
    v-if="ready"
    v-model:value="problem.input_description"
    title="输入的描述"
  />
  <TextEditor
    v-if="ready"
    v-model:value="problem.output_description"
    title="输出的描述"
  />
  <div class="box" v-for="(sample, index) in problem.samples" :key="index">
    <n-flex justify="space-between" align="center">
      <strong>测试样例 {{ index + 1 }}</strong>
      <n-button
        tertiary
        type="warning"
        size="small"
        @click="removeSample(index)"
      >
        删除 {{ index + 1 }}
      </n-button>
    </n-flex>
    <n-grid x-gap="20" cols="2">
      <n-gi span="1">
        <n-flex vertical>
          <span>输入样例</span>
          <n-input type="textarea" v-model:value="sample.input" />
        </n-flex>
      </n-gi>
      <n-gi span="1">
        <n-flex vertical>
          <span>输出样例</span>
          <n-input type="textarea" v-model:value="sample.output" />
        </n-flex>
      </n-gi>
    </n-grid>
  </div>
  <n-button class="addSamples box" tertiary type="primary" @click="addSample">
    添加用例
  </n-button>
  <TextEditor v-if="ready" v-model:value="problem.hint" title="提示（选填）" />
  <n-form>
    <n-form-item label="题目的来源（选填）">
      <n-input
        v-model:value="problem.source"
        placeholder="比如来自某道题的改编等，或者网上的资料"
      />
    </n-form-item>
    <n-form-item label="本题的考察知识点（选填，用于 AI 分析）">
      <n-input
        v-model:value="problem.prompt"
        placeholder="比如考察选择、循环、算法等知识点"
      />
    </n-form-item>
  </n-form>

  <n-divider />

  <h2 class="title">代码区域</h2>

  <n-form inline label-placement="left">
    <n-form-item label="编程语言">
      <n-checkbox-group v-model:value="problem.languages">
        <n-flex align="center">
          <n-checkbox
            v-for="(language, index) in languageOptions"
            :key="index"
            :value="language.value"
            :label="language.label"
          />
        </n-flex>
      </n-checkbox-group>
    </n-form-item>
    <n-form-item>
      <n-checkbox
        v-model:checked="needTemplate"
        label="预制代码（显示在编辑器中，帮助快速上手）"
      />
    </n-form-item>
    <n-form-item>
      <n-button
        v-if="needTemplate"
        size="small"
        tertiary
        type="warning"
        @click="resetTemplate(currentActiveTemplate)"
      >
        重置 {{ LANGUAGE_SHOW_VALUE[currentActiveTemplate] }} 的预制代码
      </n-button>
    </n-form-item>
  </n-form>

  <n-grid :cols="2" x-gap="20">
    <n-gi>
      <n-form>
        <n-form-item label="本题参考答案（选填，用于 AI 分析，不会泄露）">
          <n-tabs
            type="segment"
            default-value="Python3"
            v-model:value="currentActiveAnswer"
          >
            <n-tab-pane
              v-for="(answer, index) in problem.answers"
              :key="index"
              :name="answer.language"
            >
              <CodeEditor
                v-model:value="answer.code"
                :language="answer.language"
                :font-size="16"
                height="300px"
              />
            </n-tab-pane>
          </n-tabs>
        </n-form-item>
      </n-form>
    </n-gi>
    <n-gi>
      <n-form v-if="needTemplate">
        <n-form-item label="编写预制代码">
          <n-tabs
            type="segment"
            default-value="Python3"
            v-model:value="currentActiveTemplate"
          >
            <n-tab-pane
              v-for="(lang, index) in problem.languages"
              :key="index"
              :name="lang"
            >
              <CodeEditor
                v-model:value="template[lang]"
                :language="lang"
                :font-size="16"
                height="300px"
              />
            </n-tab-pane>
          </n-tabs>
        </n-form-item>
      </n-form>
    </n-gi>
  </n-grid>

  <n-divider />

  <h2 class="title">流程图区域</h2>

  <!-- 流程图相关设置 -->
  <n-form inline label-placement="left" :show-feedback="false">
    <n-form-item label="根据上面的答案智能生成 Mermaid 代码">
      <n-button
        type="primary"
        size="small"
        :disabled="!problem.answers.filter((a) => a.code).length"
        @click="generateMermaid"
      >
        AI 生成
      </n-button>
    </n-form-item>
    <n-form-item label="允许提交流程图">
      <n-switch v-model:value="problem.allow_flowchart" />
    </n-form-item>
    <n-form-item label="显示标准流程图">
      <n-switch v-model:value="problem.show_flowchart" />
    </n-form-item>
  </n-form>

  <n-form>
    <n-form-item>
      <MermaidEditor
        v-model="problem.mermaid_code"
        @render-success="onMermaidRenderSuccess"
      />
    </n-form-item>
    <n-form-item label="流程图提示信息（选填）">
      <n-input
        v-model:value="problem.flowchart_hint"
        placeholder="请输入流程图相关的提示信息，帮助学生理解题目要求"
      />
    </n-form-item>
  </n-form>
  <n-divider />
  <n-alert
    class="box"
    v-if="problem.test_case_score.length"
    :show-icon="false"
    type="info"
  >
    <template #header>
      <n-flex align="center">
        <div>
          测试组编号 {{ problem.test_case_id.slice(0, 12) }} 共有
          {{ problem.test_case_score.length }}
          条测试用例
        </div>
        <n-button
          v-if="problem.id"
          tertiary
          type="info"
          size="small"
          @click="downloadTestcases"
        >
          下载
        </n-button>
      </n-flex>
    </template>
  </n-alert>
  <n-flex style="margin-bottom: 120px" align="center" justify="end">
    <n-tooltip placement="left">
      <template #trigger>
        <n-button text>温馨提醒</n-button>
      </template>
      【测试用例】最好要有10个，要考虑边界情况，且不要跟【测试样例】一模一样
    </n-tooltip>
    <div>
      <n-upload
        :show-file-list="false"
        accept=".zip"
        :custom-request="handleUploadTestcases"
      >
        <n-button type="info">上传测试用例</n-button>
      </n-upload>
    </div>
    <n-button type="primary" @click="submit">提交</n-button>
  </n-flex>
</template>

<style scoped>
.title {
  margin-top: 0;
}

.box {
  margin-bottom: 20px;
}

.w-100 {
  width: 100px;
}

.problemTitleInput {
  width: 300px;
}

.tag {
  width: 500px;
}

.addSamples {
  width: 100%;
}
</style>

<script setup lang="ts">
import { getProblemTagList } from "~/shared/api"
import TextEditor from "~/shared/components/TextEditor.vue"
import {
  CODE_TEMPLATES,
  LANGUAGE_SHOW_VALUE,
  STORAGE_KEY,
} from "~/utils/constants"
import download from "~/utils/download"
import { unique } from "~/utils/functions"
import { BlankProblem, LANGUAGE, Tag } from "~/utils/types"
import {
  createContestProblem,
  createProblem,
  editContestProblem,
  editProblem,
  getProblem,
  uploadTestcases,
} from "../api"

const CodeEditor = defineAsyncComponent(
  () => import("~/shared/components/CodeEditor.vue"),
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
  difficulty: "Low",
  visible: false,
  share_submission: false,
  tags: [],
  languages: ["C", "Python3"],
  template: {},
  samples: [
    { input: "", output: "" },
    { input: "", output: "" },
    { input: "", output: "" },
  ],
  spj: false,
  spj_language: "",
  spj_code: "",
  spj_compile_ok: false,
  test_case_id: "",
  test_case_score: [],
  rule_type: "ACM",
  hint: "",
  source: "",
  io_mode: {
    io_mode: "Standard IO",
    input: "input.txt",
    output: "output.txt",
  },
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

// 这三个用的少，就不缓存本地了
const [needTemplate, toggleNeedTemplate] = useToggle(false)
const template = reactive(JSON.parse(JSON.stringify(CODE_TEMPLATES)))
const currentActiveTemplate = ref<LANGUAGE>("C")

// 给 TextEditor 用
const [ready, toggleReady] = useToggle(false)

const difficultyOptions: SelectOption[] = [
  { label: "简单", value: "Low" },
  { label: "中等", value: "Mid" },
  { label: "困难", value: "High" },
]

const languageOptions = [
  { label: LANGUAGE_SHOW_VALUE["C"], value: "C" },
  { label: LANGUAGE_SHOW_VALUE["Python3"], value: "Python3" },
]

const tagOptions = computed(() =>
  tagList.value.map((tag) => ({ label: tag.name, value: tag.name })),
)

async function getProblemDetail() {
  if (!props.problemID) {
    toggleReady(true)
    return
  }
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
  problem.value.spj = data.spj
  problem.value.spj_language = data.spj_language
  problem.value.spj_code = data.spj_code
  problem.value.spj_compile_ok = data.spj_compile_ok
  problem.value.test_case_id = data.test_case_id
  problem.value.test_case_score = data.test_case_score
  problem.value.rule_type = data.rule_type
  problem.value.hint = data.hint
  problem.value.source = data.source
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
      if (!file.output_name && problem.value.spj) {
        file.output_name = "-"
      }
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

// 题目是否有漏写的
function detectProblemCompletion() {
  let flag = false
  // 标题
  if (!problem.value._id || !problem.value.title) {
    message.error("编号或标题没有填写")
    flag = true
  }
  // 标签
  else if (tags.value.upload.length === 0 && tags.value.select.length === 0) {
    message.error("标签没有填写")
    flag = true
  }
  // 题目
  else if (
    !problem.value.description ||
    !problem.value.input_description ||
    !problem.value.output_description
  ) {
    message.error("题目或输入或输出没有填写")
    flag = true
  }
  // 样例
  else if (problem.value.samples.length == 0) {
    message.error("样例没有填写")
    flag = true
  }
  // 样例是空的
  else if (
    problem.value.samples.some(
      (sample) => sample.output === "" || sample.input === "",
    )
  ) {
    message.error("空样例没有删干净")
    flag = true
  }
  // 测试用例
  else if (problem.value.test_case_score.length === 0) {
    message.error("测试用例没有上传")
    flag = true
  } else if (problem.value.languages.length === 0) {
    message.error("编程语言没有选择")
    flag = true
  }
  // 通过了
  else {
    flag = false
  }
  return flag
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

async function submit() {
  const notCompleted = detectProblemCompletion()
  if (notCompleted) return
  filterHint()
  getTemplate()
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
  <TextEditor v-if="ready" v-model:value="problem.hint" title="提示" />
  <n-form>
    <n-form-item label="题目的来源">
      <n-input
        v-model:value="problem.source"
        placeholder="比如来自某道题的改编等，或者网上的资料"
      />
    </n-form-item>
  </n-form>
  <n-form v-if="needTemplate">
    <n-form-item label="编写代码模板">
      <n-tabs
        type="segment"
        default-value="C"
        class="template box"
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
            height="200px"
          />
        </n-tab-pane>
      </n-tabs>
    </n-form-item>
  </n-form>

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
  <n-space style="margin-bottom: 100px" justify="space-between">
    <n-form inline label-placement="left" :show-feedback="false">
      <n-form-item label="语言">
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
          label="代码模板（一般用不到）"
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
          重置 {{ LANGUAGE_SHOW_VALUE[currentActiveTemplate] }} 代码模板
        </n-button>
      </n-form-item>
    </n-form>
    <n-flex align="center">
      <n-tooltip placement="left">
        <template #trigger>
          <n-button text>温馨提醒</n-button>
        </template>
        【测试用例】最好要有10个，要考虑边界情况，不要跟【测试样例】一模一样
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
  </n-space>
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

.template {
  width: 60%;
}
</style>

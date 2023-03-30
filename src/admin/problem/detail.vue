<script setup lang="ts">
import TextEditor from "~/shared/TextEditor.vue"
import Monaco from "~/shared/Monaco.vue"

import { SelectOption, UploadCustomRequestOptions } from "naive-ui"
import { unique } from "~/utils/functions"
import { BlankProblem, LANGUAGE, Tag } from "~/utils/types"
import { getProblemTagList } from "~/shared/api"
import { LANGUAGE_SHOW_VALUE, CODE_TEMPLATES } from "~/utils/constants"
import download from "~/utils/download"
import {
  createContestProblem,
  createProblem,
  editContestProblem,
  editProblem,
  getProblem,
  uploadTestcases,
} from "../api"

interface Props {
  problemID?: string
  contestID?: string
}

const message = useMessage()
const route = useRoute()
const router = useRouter()
const props = defineProps<Props>()

const problem = reactive<BlankProblem>({
  _id: "",
  title: "",
  description: "",
  input_description: "",
  output_description: "",
  time_limit: 1000,
  memory_limit: 64,
  difficulty: "Low",
  visible: true,
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

const template = reactive(JSON.parse(JSON.stringify(CODE_TEMPLATES)))
const currentActiveTemplate = ref<LANGUAGE>("C")

const existingTags = shallowRef<Tag[]>([])
const fromExistingTags = shallowRef<string[]>([])
const newTags = shallowRef<string[]>([])
const [needTemplate, toggleNeedTemplate] = useToggle(false)
const [ready, toggleReady] = useToggle(false)

const difficultyOptions: SelectOption[] = [
  { label: "简单", value: "Low" },
  { label: "中等", value: "Mid" },
  { label: "困难", value: "High" },
]

const languageOptions = [
  { label: LANGUAGE_SHOW_VALUE["C"], value: "C" },
  { label: LANGUAGE_SHOW_VALUE["Python3"], value: "Python3" },
  { label: LANGUAGE_SHOW_VALUE["C++"], value: "C++" },
  { label: LANGUAGE_SHOW_VALUE["Java"], value: "Java" },
  { label: LANGUAGE_SHOW_VALUE["JavaScript"], value: "JavaScript" },
  { label: LANGUAGE_SHOW_VALUE["Golang"], value: "Golang" },
]

const tagOptions = computed(() =>
  existingTags.value.map((tag) => ({ label: tag.name, value: tag.name }))
)

async function getProblemDetail() {
  if (!props.problemID) return
  const { data } = await getProblem(props.problemID)
  toggleReady(true)
  problem.id = data.id
  problem._id = data._id
  problem.title = data.title
  problem.description = data.description
  problem.input_description = data.input_description
  problem.output_description = data.output_description
  problem.time_limit = data.time_limit
  problem.memory_limit = data.memory_limit
  problem.memory_limit = data.memory_limit
  problem.difficulty = data.difficulty
  problem.visible = data.visible
  problem.share_submission = data.share_submission
  problem.tags = data.tags
  problem.languages = data.languages
  problem.template = data.template
  problem.samples = data.samples
  problem.samples = data.samples
  problem.spj = data.spj
  problem.spj_language = data.spj_language
  problem.spj_code = data.spj_code
  problem.spj_compile_ok = data.spj_compile_ok
  problem.test_case_id = data.test_case_id
  problem.test_case_score = data.test_case_score
  problem.rule_type = data.rule_type
  problem.hint = data.hint
  problem.source = data.source
  problem.io_mode = data.io_mode
  if (problem.contest_id) {
    problem.contest_id = problem.contest_id
  }

  // 下面是用来显示的：
  // 代码模板 和 模板开关
  problem.languages.forEach((lang) => {
    if (data.template[lang]) {
      template[lang] = data.template[lang]
      toggleNeedTemplate(true)
    }
  })
  // 标签
  fromExistingTags.value = data.tags
}

async function listTags() {
  const res = await getProblemTagList()
  existingTags.value = res.data
}

function updateNewTags(v: string[]) {
  const blanks = []
  const uniqueTags = unique(v)
  const tags = existingTags.value.map((t) => t.name)
  for (let i = 0; i < uniqueTags.length; i++) {
    const tag = uniqueTags[i]
    if (tags.indexOf(tag) < 0) {
      blanks.push(tag)
    } else {
      message.error("已经存在标签：" + tag)
      break
    }
  }
  newTags.value = blanks
}

function addSample() {
  problem.samples.push({ input: "", output: "" })
}

function removeSample(index: number) {
  problem.samples.splice(index, 1)
}

function resetTemplate(language: LANGUAGE) {
  template[language] = CODE_TEMPLATES[language]
}

async function handleUploadTestcases({ file }: UploadCustomRequestOptions) {
  try {
    const res = await uploadTestcases(file.file!)
    // @ts-ignore:
    if (res.error) {
      message.error("上传测试用例失败")
      return
    }
    const testcases = res.data.info
    for (let file of testcases) {
      file.score = (100 / testcases.length).toFixed(0)
      if (!file.output_name && problem.spj) {
        file.output_name = "-"
      }
    }
    problem.test_case_score = testcases
    problem.test_case_id = res.data.id
  } catch (err) {
    message.error("上传测试用例失败")
  }
}

function downloadTestcases() {
  download("test_case?problem_id=" + problem.id)
}

// 题目是否有漏写的
function detectProblemCompletion() {
  let flag = false
  // 标题
  if (!problem._id || !problem.title) {
    message.error("编号或标题没有填写")
    flag = true
  }
  // 标签
  else if (newTags.value.length === 0 && fromExistingTags.value.length === 0) {
    message.error("标签没有填写")
    flag = true
  }
  // 题目
  else if (
    !problem.description ||
    !problem.input_description ||
    !problem.output_description
  ) {
    message.error("题目或输入或输出没有填写")
    flag = true
  }
  // 样例
  else if (problem.samples.length == 0) {
    message.error("样例没有填写")
    flag = true
  }
  // 样例是空的
  else if (
    problem.samples.some(
      (sample) => sample.output === "" || sample.input === ""
    )
  ) {
    message.error("空样例没有删干净")
    flag = true
  }
  // 测试用例
  else if (problem.test_case_score.length === 0) {
    message.error("测试用例没有上传")
    flag = true
  } else if (problem.languages.length === 0) {
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
    problem.template = {}
  } else {
    problem.languages.forEach((lang) => {
      if (CODE_TEMPLATES[lang] !== template[lang]) {
        problem.template[lang] = template[lang]
      } else {
        delete problem.template[lang]
      }
    })
  }
}

async function submit() {
  const notComplete = detectProblemCompletion()
  if (notComplete) return
  getTemplate()
  problem.tags = [...newTags.value, ...fromExistingTags.value]
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
    problem.contest_id = props.contestID
  }
  try {
    await api!(problem)
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

onMounted(() => {
  if (
    route.name === "admin problem create" ||
    route.name === "admin contest problem create"
  ) {
    toggleReady(true)
  }
  listTags()
  getProblemDetail()
})

watch([fromExistingTags, newTags], (tags) => {
  const uniqueTags = unique<string>(tags[0].concat(tags[1]))
  problem.tags = uniqueTags
})
</script>

<template>
  <n-form inline label-placement="left">
    <n-form-item label="显示编号">
      <n-input class="w-100" v-model:value="problem._id" />
    </n-form-item>
    <n-form-item label="题目">
      <n-input class="titleInput" v-model:value="problem.title" />
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
        v-model:value="fromExistingTags"
        :options="tagOptions"
      />
    </n-form-item>
    <n-form-item label="新增的标签">
      <n-dynamic-tags v-model:value="newTags" @update:value="updateNewTags" />
    </n-form-item>
  </n-form>
  <TextEditor
    v-if="ready"
    v-model:value="problem.description"
    title="题目本体"
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
    <n-space justify="space-between" align="center">
      <strong>测试样例 {{ index + 1 }}</strong>
      <n-button
        tertiary
        type="warning"
        size="small"
        @click="removeSample(index)"
      >
        删除 {{ index + 1 }}
      </n-button>
    </n-space>
    <n-grid x-gap="20" cols="2">
      <n-gi span="1">
        <n-space vertical>
          <span>输入样例</span>
          <n-input type="textarea" v-model:value="sample.input" />
        </n-space>
      </n-gi>
      <n-gi span="1">
        <n-space vertical>
          <span>输出样例</span>
          <n-input type="textarea" v-model:value="sample.output" />
        </n-space>
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
  <n-tabs
    type="segment"
    class="template box"
    v-if="needTemplate"
    v-model:value="currentActiveTemplate"
  >
    <n-tab-pane
      v-for="(lang, index) in problem.languages"
      :key="index"
      :name="lang"
    >
      <Monaco
        v-model:value="template[lang]"
        :language="lang"
        :font-size="16"
        height="200px"
      />
    </n-tab-pane>
  </n-tabs>
  <n-alert
    class="box"
    v-if="problem.test_case_score.length"
    :show-icon="false"
    type="info"
  >
    <template #header>
      <n-space align="center">
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
      </n-space>
    </template>
  </n-alert>
  <n-space justify="space-between">
    <n-form inline label-placement="left">
      <n-form-item label="语言">
        <n-checkbox-group v-model:value="problem.languages">
          <n-space align="center">
            <n-checkbox
              v-for="(language, index) in languageOptions"
              :key="index"
              :value="language.value"
              :label="language.label"
            />
          </n-space>
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
    <n-space>
      <n-upload
        :show-file-list="false"
        accept=".zip"
        :custom-request="handleUploadTestcases"
      >
        <n-button type="info">上传测试用例</n-button>
      </n-upload>
      <n-button type="primary" @click="submit">保存</n-button>
    </n-space>
  </n-space>
</template>

<style scoped>
.box {
  margin-bottom: 20px;
}

.w-100 {
  width: 100px;
}

.titleInput {
  width: 300px;
}

.title {
  margin-bottom: 12px;
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

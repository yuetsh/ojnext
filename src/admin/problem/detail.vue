<script setup lang="ts">
import TextEditor from "~/shared/TextEditor.vue"
import Monaco from "~/shared/Monaco.vue"

import { SelectOption, UploadCustomRequestOptions } from "naive-ui"
import { unique } from "~/utils/functions"
import { LANGUAGE, Problem, Tag, Testcase } from "~/utils/types"
import { getProblemTagList } from "~/shared/api"
import { LANGUAGE_SHOW_VALUE, CODE_TEMPLATES } from "~/utils/constants"

import { uploadTestcases } from "../api"

interface AlterProblem {
  spj_language: string
  spj_code: string
  spj_compile_ok: boolean
  test_case_id: string
  test_case_score: Testcase[]
}

type ExcludeKeys =
  | "id"
  | "created_by"
  | "create_time"
  | "last_update_time"
  | "my_status"
  | "contest"
  | "statistic_info"
  | "accepted_number"
  | "submission_number"
  | "total_score"

const message = useMessage()

const problem = reactive<Omit<Problem, ExcludeKeys> & AlterProblem>({
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
const [needTemplate] = useToggle(false)

const difficultyOptions: SelectOption[] = [
  { label: "简单", value: "Low" },
  { label: "中等", value: "Med" },
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

function downloadTestcases() {}

function saveProblem() {
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
  console.log(problem.template)
}

onMounted(() => {
  listTags()
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
    v-model:value="problem.description"
    title="题目本体"
    :min-height="300"
  />
  <TextEditor v-model:value="problem.input_description" title="输入的描述" />
  <TextEditor v-model:value="problem.output_description" title="输出的描述" />
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
  <TextEditor v-model:value="problem.hint" title="提示" />
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
      <n-button type="primary" @click="saveProblem">保存</n-button>
    </n-space>
  </n-space>
  <n-alert :show-icon="false" v-if="problem.test_case_score.length" type="info">
    <template #header>
      <n-space align="center">
        <div>
          测试组编号 {{ problem.test_case_id.slice(0, 12) }} 共有
          {{ problem.test_case_score.length }}
          条测试用例
        </div>
        <n-button tertiary type="info" size="small" @click="downloadTestcases">
          下载
        </n-button>
      </n-space>
    </template>
  </n-alert>
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

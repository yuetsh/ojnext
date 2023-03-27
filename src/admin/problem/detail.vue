<script setup lang="ts">
import { SelectOption } from "naive-ui"
import { getProblemTagList } from "~/shared/api"
import TextEditor from "~/shared/TextEditor.vue"
import { unique } from "~/utils/functions"
import { Problem, Tag } from "~/utils/types"

interface AlterProblem {
  spj_language: string
  spj_code: string
  spj_compile_ok: boolean
  test_case_id: string
  test_case_score: any[]
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
  languages: ["C", "C++", "Python3"],
  template: {},
  samples: [{ input: "", output: "" }],
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

const existingTags = shallowRef<Tag[]>([])
const fromExistingTags = shallowRef<string[]>([])
const newTags = shallowRef<string[]>([])

const difficultyOptions: SelectOption[] = [
  { label: "简单", value: "Low" },
  { label: "中等", value: "Med" },
  { label: "困难", value: "High" },
]

const languageOptions = [
  { label: "C", value: "C" },
  { label: "C++", value: "C++" },
  { label: "Python", value: "Python3" },
  { label: "Java", value: "Java" },
  { label: "JS", value: "JavaScript" },
  { label: "Go", value: "Golang" },
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
      <n-input class="id" v-model:value="problem._id" />
    </n-form-item>
    <n-form-item label="题目">
      <n-input class="titleInput" v-model:value="problem.title" />
    </n-form-item>
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
  </n-form>
  <n-form inline label-placement="left">
    <n-form-item label="可见">
      <n-switch v-model:value="problem.visible" />
    </n-form-item>
    <n-form-item label="难度">
      <n-select
        class="difficulty"
        :options="difficultyOptions"
        v-model:value="problem.difficulty"
      />
    </n-form-item>
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
    title="题目"
    :min-height="300"
  />
  <TextEditor v-model:value="problem.input_description" title="输入的描述" />
  <TextEditor v-model:value="problem.output_description" title="输出的描述" />
  <div class="samples" v-for="(sample, index) in problem.samples" :key="index">
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
  <n-button class="addSamples" tertiary type="primary" @click="addSample">
    添加用例
  </n-button>
  <TextEditor v-model:value="problem.hint" title="提示" />
  <n-form>
    <n-form-item label="题目的来源">
      <n-input
        v-model:value="problem.source"
        placeholder="（比如来自某道题的改编等，或者网上的资料）"
      />
    </n-form-item>
  </n-form>
</template>

<style scoped>
.id {
  width: 100px;
}
.titleInput {
  width: 300px;
}

.title {
  margin-bottom: 12px;
}
.difficulty {
  width: 100px;
}
.tag {
  width: 300px;
}

.samples {
  margin-bottom: 20px;
}

.addSamples {
  width: 100%;
  margin-bottom: 20px;
}
</style>

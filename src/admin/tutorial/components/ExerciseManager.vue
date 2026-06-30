<script setup lang="ts">
import {
  Exercise,
  ExerciseType,
  ExerciseMcqData,
  ExerciseSortData,
  ExerciseFillData,
  ExerciseMatchData,
  ExercisePredictData,
  ExerciseDebugData,
  ExerciseGroupData,
} from "utils/types"
import {
  getAdminExercises,
  createExercise,
  updateExercise,
  deleteExercise,
} from "admin/api"

const props = defineProps<{ tutorialId: number }>()
const message = useMessage()
const dialog = useDialog()

const exercises = ref<Exercise[]>([])
const showForm = ref(false)
const editingId = ref<number | null>(null)
const formType = ref<ExerciseType>("mcq")
const formOrder = ref(0)

const mcqQuestion = ref("")
const mcqOptions = ref(["", ""])
const mcqAnswer = ref<number[]>([])

const sortQuestion = ref("")
const sortCode = ref("")

const fillQuestion = ref("")
const fillCode = ref("")

const matchQuestion = ref("")
const matchLeft = ref("")
const matchRight = ref("")

const predictQuestion = ref("")
const predictCode = ref("")
const predictAnswer = ref("")

const debugQuestion = ref("")
const debugCode = ref("")
const debugAnswer = ref<number[]>([])
const debugExplanation = ref("")

const groupQuestion = ref("")
const groupBuckets = ref("")
const groupItems = ref("")

const debugLines = computed(() =>
  debugCode.value === "" ? [] : debugCode.value.split("\n"),
)

async function load() {
  exercises.value = await getAdminExercises(props.tutorialId)
}

onMounted(load)

function resetForms() {
  mcqQuestion.value = ""
  mcqOptions.value = ["", ""]
  mcqAnswer.value = []
  sortQuestion.value = ""
  sortCode.value = ""
  fillQuestion.value = ""
  fillCode.value = ""
  matchQuestion.value = ""
  matchLeft.value = ""
  matchRight.value = ""
  predictQuestion.value = ""
  predictCode.value = ""
  predictAnswer.value = ""
  debugQuestion.value = ""
  debugCode.value = ""
  debugAnswer.value = []
  debugExplanation.value = ""
  groupQuestion.value = ""
  groupBuckets.value = ""
  groupItems.value = ""
}

function openCreate() {
  editingId.value = null
  formType.value = "mcq"
  formOrder.value = exercises.value.length
  resetForms()
  showForm.value = true
}

function openEdit(ex: Exercise) {
  editingId.value = ex.id
  formType.value = ex.type
  formOrder.value = ex.order
  resetForms()
  if (ex.type === "mcq") {
    const d = ex.data as ExerciseMcqData
    mcqQuestion.value = d.question
    mcqOptions.value = [...d.options]
    mcqAnswer.value = [...d.answer]
  } else if (ex.type === "sort") {
    const d = ex.data as ExerciseSortData
    sortQuestion.value = d.question
    sortCode.value = d.lines.join("\n")
  } else if (ex.type === "fill") {
    const d = ex.data as ExerciseFillData
    fillQuestion.value = d.question
    fillCode.value = d.code
  } else if (ex.type === "match") {
    const d = ex.data as ExerciseMatchData
    matchQuestion.value = d.question
    matchLeft.value = d.left.join("\n")
    // 按答案顺序还原右列，重存时识别答案保持为顺序对应
    matchRight.value = d.answer.map((a) => d.right[a]).join("\n")
  } else if (ex.type === "predict") {
    const d = ex.data as ExercisePredictData
    predictQuestion.value = d.question
    predictCode.value = d.code
    predictAnswer.value = d.answer.join("\n===\n")
  } else if (ex.type === "debug") {
    const d = ex.data as ExerciseDebugData
    debugQuestion.value = d.question
    debugCode.value = d.lines.join("\n")
    debugAnswer.value = [...d.answer]
    debugExplanation.value = d.explanation ?? ""
  } else if (ex.type === "group") {
    const d = ex.data as ExerciseGroupData
    groupQuestion.value = d.question
    groupBuckets.value = d.buckets.join("\n")
    groupItems.value = d.items
      .map((it, i) => `${it} => ${d.buckets[d.answer[i]]}`)
      .join("\n")
  }
  showForm.value = true
}

function toggleAnswer(i: number) {
  const idx = mcqAnswer.value.indexOf(i)
  if (idx === -1) mcqAnswer.value.push(i)
  else mcqAnswer.value.splice(idx, 1)
}

function toggleDebug(i: number) {
  const idx = debugAnswer.value.indexOf(i)
  if (idx === -1) debugAnswer.value.push(i)
  else debugAnswer.value.splice(idx, 1)
}

function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "")
}

function buildData(): Record<string, unknown> | null {
  if (formType.value === "mcq") {
    if (mcqAnswer.value.length === 0) {
      message.error("请至少勾选一个正确答案")
      return null
    }
    return {
      question: mcqQuestion.value || "下面选项中正确是哪个？",
      options: mcqOptions.value,
      answer: mcqAnswer.value,
    }
  }
  if (formType.value === "sort") {
    return {
      question: sortQuestion.value || "将下列代码行排列为正确顺序",
      lines: sortCode.value.split("\n").filter((l) => l.trim() !== ""),
    }
  }
  if (formType.value === "fill") {
    return { question: fillQuestion.value, code: fillCode.value }
  }
  if (formType.value === "match") {
    const left = splitLines(matchLeft.value)
    const right = splitLines(matchRight.value)
    if (left.length < 2 || left.length !== right.length) {
      message.error("左右两列需各至少 2 项且行数相等（按行一一对应）")
      return null
    }
    return {
      question: matchQuestion.value || "把左右两列正确连线",
      left,
      right,
      answer: left.map((_, i) => i),
    }
  }
  if (formType.value === "predict") {
    if (predictCode.value.trim() === "") {
      message.error("请填写代码")
      return null
    }
    const answer = predictAnswer.value
      .split(/\n===\n/)
      .map((a) => a.replace(/\s+$/, ""))
      .filter((a) => a.trim() !== "")
    if (answer.length === 0) {
      message.error("请填写至少一个正确输出")
      return null
    }
    return {
      question: predictQuestion.value || "这段代码会输出什么？",
      code: predictCode.value,
      answer,
    }
  }
  if (formType.value === "debug") {
    const lines = debugCode.value.split("\n")
    const answer = debugAnswer.value
      .filter((i) => i < lines.length)
      .sort((a, b) => a - b)
    if (lines.length === 0 || answer.length === 0) {
      message.error("请填写代码并勾选至少一行错误")
      return null
    }
    const data: Record<string, unknown> = {
      question: debugQuestion.value || "下面代码哪几行有错？",
      lines,
      answer,
    }
    if (debugExplanation.value.trim() !== "") {
      data.explanation = debugExplanation.value.trim()
    }
    return data
  }
  // group
  const buckets = splitLines(groupBuckets.value)
  if (buckets.length < 2) {
    message.error("请至少填写 2 个分组")
    return null
  }
  const items: string[] = []
  const answer: number[] = []
  for (const line of groupItems.value.split("\n")) {
    if (line.trim() === "") continue
    const parts = line.split("=>")
    if (parts.length !== 2) {
      message.error(`项目格式应为「项目 => 分组名」：${line}`)
      return null
    }
    const item = parts[0].trim()
    const bucket = buckets.indexOf(parts[1].trim())
    if (item === "" || bucket === -1) {
      message.error(`项目或分组名无效：${line}`)
      return null
    }
    items.push(item)
    answer.push(bucket)
  }
  if (items.length === 0) {
    message.error("请至少填写一个项目")
    return null
  }
  return {
    question: groupQuestion.value || "把下列项目归类到正确的分组",
    buckets,
    items,
    answer,
  }
}

async function save() {
  const data = buildData()
  if (data === null) return

  try {
    if (editingId.value) {
      await updateExercise({
        id: editingId.value,
        type: formType.value,
        data,
        order: formOrder.value,
      })
      message.success("练习题已更新")
    } else {
      await createExercise({
        tutorial_id: props.tutorialId,
        type: formType.value,
        data,
        order: formOrder.value,
      })
      message.success("练习题已创建")
    }
    showForm.value = false
    await load()
  } catch (e: any) {
    message.error(e.data ?? "保存失败")
  }
}

function confirmDelete(id: number) {
  dialog.warning({
    title: "删除练习题",
    content: "此操作不可撤销",
    positiveText: "删除",
    onPositiveClick: async () => {
      await deleteExercise(id)
      message.success("已删除")
      await load()
    },
  })
}

function copyPlaceholder(id: number) {
  navigator.clipboard.writeText(`[[exercise:${id}]]`)
  message.success(`已复制 [[exercise:${id}]]`)
}

const TYPE_NAMES: Record<ExerciseType, string> = {
  mcq: "选择题",
  sort: "代码排序",
  fill: "代码填空",
  match: "连线匹配",
  predict: "输出预测",
  debug: "代码找错",
  group: "归类分组",
}

const TYPE_TAGS: Record<
  ExerciseType,
  "success" | "info" | "warning" | "error" | "primary" | "default"
> = {
  mcq: "success",
  sort: "info",
  fill: "warning",
  match: "primary",
  predict: "error",
  debug: "info",
  group: "warning",
}

function typeName(type: ExerciseType) {
  return TYPE_NAMES[type] ?? type
}

function typeTagType(type: ExerciseType) {
  return TYPE_TAGS[type] ?? "default"
}
</script>

<template>
  <div>
    <n-flex justify="space-between" align="center" style="margin-bottom: 16px">
      <n-text>共 {{ exercises.length }} 道练习题</n-text>
      <n-button type="primary" size="small" @click="openCreate"
        >+ 添加练习题</n-button
      >
    </n-flex>

    <n-empty v-if="exercises.length === 0" description="暂无练习题" />

    <n-list v-else bordered>
      <n-list-item v-for="ex in exercises" :key="ex.id">
        <n-flex justify="space-between" align="center">
          <div>
            <n-tag size="small" :type="typeTagType(ex.type)" :bordered="false">
              {{ typeName(ex.type) }}
            </n-tag>
            <n-text style="margin-left: 10px">
              {{ (ex.data as any).question }}
            </n-text>
          </div>
          <n-space :size="8">
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button size="small" @click="copyPlaceholder(ex.id)">
                  复制占位符
                </n-button>
              </template>
              将 [[exercise:{{ ex.id }}]] 粘贴到 Markdown 内容中
            </n-tooltip>
            <n-button size="small" @click="openEdit(ex)">编辑</n-button>
            <n-button size="small" type="error" @click="confirmDelete(ex.id)">
              删除
            </n-button>
          </n-space>
        </n-flex>
      </n-list-item>
    </n-list>

    <n-modal
      v-model:show="showForm"
      :title="editingId ? '编辑练习题' : '新建练习题'"
      preset="card"
      style="width: 560px"
    >
      <n-form label-placement="top">
        <n-form-item label="题型">
          <n-radio-group v-model:value="formType" :disabled="!!editingId">
            <n-radio value="mcq">选择题</n-radio>
            <n-radio value="sort">代码排序</n-radio>
            <n-radio value="fill">代码填空</n-radio>
            <n-radio value="match">连线匹配</n-radio>
            <n-radio value="predict">输出预测</n-radio>
            <n-radio value="debug">代码找错</n-radio>
            <n-radio value="group">归类分组</n-radio>
          </n-radio-group>
        </n-form-item>

        <n-form-item label="顺序">
          <n-input-number
            v-model:value="formOrder"
            :min="0"
            style="width: 100px"
          />
        </n-form-item>

        <template v-if="formType === 'mcq'">
          <n-form-item label="题目">
            <n-input
              v-model:value="mcqQuestion"
              type="textarea"
              :rows="2"
              placeholder="下面选项中正确是哪个？"
            />
          </n-form-item>
          <n-form-item label="选项（勾选所有正确答案）">
            <n-space vertical style="width: 100%">
              <n-flex
                v-for="(opt, i) in mcqOptions"
                :key="i"
                align="center"
                :size="8"
              >
                <n-checkbox
                  :checked="mcqAnswer.includes(i)"
                  @update:checked="toggleAnswer(i)"
                />
                <n-input
                  v-model:value="mcqOptions[i]"
                  :placeholder="`选项 ${String.fromCharCode(65 + i)}`"
                  style="flex: 1"
                />
                <n-button
                  size="small"
                  :disabled="mcqOptions.length <= 2"
                  @click="
                    () => {
                      mcqOptions.splice(i, 1)
                      mcqAnswer = mcqAnswer
                        .filter((a) => a !== i)
                        .map((a) => (a > i ? a - 1 : a))
                    }
                  "
                >
                  ✕
                </n-button>
              </n-flex>
              <n-button size="small" @click="mcqOptions.push('')">
                + 添加选项
              </n-button>
            </n-space>
          </n-form-item>
        </template>

        <template v-else-if="formType === 'sort'">
          <n-form-item label="题目">
            <n-input
              v-model:value="sortQuestion"
              type="textarea"
              :rows="2"
              placeholder="将下列代码行排列为正确顺序"
            />
          </n-form-item>
          <n-form-item label="正确代码（每行将自动成为一道排序项）">
            <n-input
              v-model:value="sortCode"
              type="textarea"
              :rows="10"
              placeholder="在此粘贴正确的代码，保存后将自动按行拆分并乱序"
              style="font-family: &quot;Monaco&quot;"
            />
          </n-form-item>
        </template>

        <template v-else-if="formType === 'fill'">
          <n-form-item label="题目说明">
            <n-input
              v-model:value="fillQuestion"
              type="textarea"
              :rows="2"
              placeholder="例：补全下面的循环语句"
            />
          </n-form-item>
          <n-form-item label="含空位的代码">
            <n-input
              v-model:value="fillCode"
              type="textarea"
              :rows="10"
              placeholder="用 {{答案}} 标记空位，多个合法答案用 | 分隔，例如：for {{i|idx}} in range(10):"
              style="font-family: &quot;Monaco&quot;"
            />
          </n-form-item>
        </template>

        <template v-else-if="formType === 'match'">
          <n-form-item label="题目说明">
            <n-input
              v-model:value="matchQuestion"
              type="textarea"
              :rows="2"
              placeholder="例：把函数和它的功能连起来"
            />
          </n-form-item>
          <n-form-item label="左列（每行一项）">
            <n-input
              v-model:value="matchLeft"
              type="textarea"
              :rows="6"
              placeholder="print&#10;len&#10;type"
            />
          </n-form-item>
          <n-form-item label="右列（与左列按行一一对应，保存后右列自动乱序）">
            <n-input
              v-model:value="matchRight"
              type="textarea"
              :rows="6"
              placeholder="输出内容&#10;返回长度&#10;返回类型"
            />
          </n-form-item>
        </template>

        <template v-else-if="formType === 'predict'">
          <n-form-item label="题目说明">
            <n-input
              v-model:value="predictQuestion"
              type="textarea"
              :rows="2"
              placeholder="例：这段代码会输出什么？"
            />
          </n-form-item>
          <n-form-item label="代码">
            <n-input
              v-model:value="predictCode"
              type="textarea"
              :rows="8"
              placeholder="print(1 + 2)"
              style="font-family: &quot;Monaco&quot;"
            />
          </n-form-item>
          <n-form-item
            label="正确输出（多个可接受答案之间用单独一行 === 分隔）"
          >
            <n-input
              v-model:value="predictAnswer"
              type="textarea"
              :rows="4"
              placeholder="3"
              style="font-family: &quot;Monaco&quot;"
            />
          </n-form-item>
        </template>

        <template v-else-if="formType === 'debug'">
          <n-form-item label="题目说明">
            <n-input
              v-model:value="debugQuestion"
              type="textarea"
              :rows="2"
              placeholder="例：下面代码哪几行有错？"
            />
          </n-form-item>
          <n-form-item label="代码（每行一项）">
            <n-input
              v-model:value="debugCode"
              type="textarea"
              :rows="8"
              placeholder="在此粘贴含错误的代码"
              style="font-family: &quot;Monaco&quot;"
            />
          </n-form-item>
          <n-form-item label="勾选错误行">
            <n-space vertical style="width: 100%">
              <n-empty
                v-if="debugLines.length === 0"
                description="先填写代码"
                size="small"
              />
              <n-flex
                v-for="(line, i) in debugLines"
                :key="i"
                align="center"
                :size="8"
              >
                <n-checkbox
                  :checked="debugAnswer.includes(i)"
                  @update:checked="toggleDebug(i)"
                />
                <n-text style="font-family: Monaco; white-space: pre">
                  {{ i + 1 }}. {{ line }}
                </n-text>
              </n-flex>
            </n-space>
          </n-form-item>
          <n-form-item label="错误说明（可选，提交后展示）">
            <n-input
              v-model:value="debugExplanation"
              type="textarea"
              :rows="2"
              placeholder="例：第 2 行少了冒号"
            />
          </n-form-item>
        </template>

        <template v-else-if="formType === 'group'">
          <n-form-item label="题目说明">
            <n-input
              v-model:value="groupQuestion"
              type="textarea"
              :rows="2"
              placeholder="例：把下面的值归类到正确的类型"
            />
          </n-form-item>
          <n-form-item label="分组（每行一个分组名）">
            <n-input
              v-model:value="groupBuckets"
              type="textarea"
              :rows="4"
              placeholder="int&#10;float&#10;str"
            />
          </n-form-item>
          <n-form-item label="项目（每行「项目 => 分组名」）">
            <n-input
              v-model:value="groupItems"
              type="textarea"
              :rows="6"
              placeholder="3 => int&#10;3.14 => float&#10;hello => str"
              style="font-family: &quot;Monaco&quot;"
            />
          </n-form-item>
        </template>
      </n-form>

      <template #footer>
        <n-flex justify="end" :size="8">
          <n-button @click="showForm = false">取消</n-button>
          <n-button type="primary" @click="save">保存</n-button>
        </n-flex>
      </template>
    </n-modal>
  </div>
</template>

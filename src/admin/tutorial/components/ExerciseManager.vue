<script setup lang="ts">
import { Exercise, ExerciseMcqData, ExerciseSortData } from "utils/types"
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
const formType = ref<"mcq" | "sort">("mcq")
const formOrder = ref(0)

const mcqQuestion = ref("")
const mcqOptions = ref(["", ""])
const mcqAnswer = ref(0)

const sortCode = ref("")

async function load() {
  exercises.value = await getAdminExercises(props.tutorialId)
}

onMounted(load)

function openCreate() {
  editingId.value = null
  formType.value = "mcq"
  formOrder.value = exercises.value.length
  mcqQuestion.value = ""
  mcqOptions.value = ["", ""]
  mcqAnswer.value = 0
  sortCode.value = ""
  showForm.value = true
}

function openEdit(ex: Exercise) {
  editingId.value = ex.id
  formType.value = ex.type
  formOrder.value = ex.order
  if (ex.type === "mcq") {
    const d = ex.data as ExerciseMcqData
    mcqQuestion.value = d.question
    mcqOptions.value = [...d.options]
    mcqAnswer.value = d.answer
  } else {
    const d = ex.data as ExerciseSortData
    sortCode.value = d.lines.join("\n")
  }
  showForm.value = true
}

async function save() {
  const data =
    formType.value === "mcq"
      ? { question: mcqQuestion.value, options: mcqOptions.value, answer: mcqAnswer.value }
      : {
          question: "将下列代码行排列为正确顺序",
          lines: sortCode.value.split("\n").filter((l) => l.trim() !== ""),
        }

  try {
    if (editingId.value) {
      await updateExercise({ id: editingId.value, type: formType.value, data, order: formOrder.value })
      message.success("练习题已更新")
    } else {
      await createExercise({ tutorial_id: props.tutorialId, type: formType.value, data, order: formOrder.value })
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

function typeName(type: string) {
  return type === "mcq" ? "选择题" : "代码排序"
}
</script>

<template>
  <div>
    <n-flex justify="space-between" align="center" style="margin-bottom: 16px">
      <n-text>共 {{ exercises.length }} 道练习题</n-text>
      <n-button type="primary" size="small" @click="openCreate">+ 添加练习题</n-button>
    </n-flex>

    <n-empty v-if="exercises.length === 0" description="暂无练习题" />

    <n-list v-else bordered>
      <n-list-item v-for="ex in exercises" :key="ex.id">
        <n-flex justify="space-between" align="center">
          <div>
            <n-tag
              size="small"
              :type="ex.type === 'mcq' ? 'success' : 'info'"
              :bordered="false"
            >
              {{ typeName(ex.type) }}
            </n-tag>
            <n-text style="margin-left: 10px">
              {{ (ex.data as any).question }}
            </n-text>
          </div>
          <n-space :size="8">
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button size="small" @click="copyPlaceholder(ex.id)">复制占位符</n-button>
              </template>
              将 [[exercise:{{ ex.id }}]] 粘贴到 Markdown 内容中
            </n-tooltip>
            <n-button size="small" @click="openEdit(ex)">编辑</n-button>
            <n-button size="small" type="error" @click="confirmDelete(ex.id)">删除</n-button>
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
          </n-radio-group>
        </n-form-item>

        <n-form-item label="顺序">
          <n-input-number v-model:value="formOrder" :min="0" style="width: 100px" />
        </n-form-item>

        <template v-if="formType === 'mcq'">
          <n-form-item label="题目">
            <n-input v-model:value="mcqQuestion" type="textarea" :rows="2" />
          </n-form-item>
          <n-form-item label="选项（正确答案前选择单选按钮）">
            <n-space vertical style="width: 100%">
              <n-flex v-for="(opt, i) in mcqOptions" :key="i" align="center" :size="8">
                <n-radio
                  :value="i"
                  :checked="mcqAnswer === i"
                  @update:checked="$event && (mcqAnswer = i)"
                />
                <n-input
                  v-model:value="mcqOptions[i]"
                  :placeholder="`选项 ${String.fromCharCode(65 + i)}`"
                  style="flex: 1"
                />
                <n-button
                  size="small"
                  :disabled="mcqOptions.length <= 2"
                  @click="mcqOptions.splice(i, 1)"
                >
                  ✕
                </n-button>
              </n-flex>
              <n-button size="small" @click="mcqOptions.push('')">+ 添加选项</n-button>
            </n-space>
          </n-form-item>
        </template>

        <template v-else>
          <n-form-item label="正确代码（每行将自动成为一道排序项）">
            <n-input
              v-model:value="sortCode"
              type="textarea"
              :rows="10"
              placeholder="在此粘贴正确的代码，保存后将自动按行拆分并乱序"
              style="font-family: monospace"
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

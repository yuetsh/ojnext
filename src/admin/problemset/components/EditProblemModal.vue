<script setup lang="ts">
import {
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSwitch,
  NButton,
  NFlex,
} from "naive-ui"
import { ProblemSetProblem } from "utils/types"

interface Props {
  show: boolean
  problem: ProblemSetProblem | null
}

interface Emits {
  (e: "update:show", value: boolean): void
  (
    e: "confirm",
    data: {
      order: number
      is_required: boolean
      score: number
      hint: string
    },
  ): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const editProblemOrder = ref(0)
const editProblemRequired = ref(true)
const editProblemScore = ref(0)
const editProblemHint = ref("")

function handleConfirm() {
  emit("confirm", {
    order: editProblemOrder.value,
    is_required: editProblemRequired.value,
    score: editProblemScore.value,
    hint: editProblemHint.value || "",
  })
}

function handleCancel() {
  emit("update:show", false)
}

// 当问题数据变化时，更新表单数据
watch(
  () => props.problem,
  (newProblem) => {
    if (newProblem) {
      editProblemOrder.value = newProblem.order
      editProblemRequired.value = newProblem.is_required
      editProblemScore.value = newProblem.score
      editProblemHint.value = newProblem.hint || ""
    }
  },
  { immediate: true },
)
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    title="编辑题目"
    style="width: 500px"
    @update:show="emit('update:show', $event)"
  >
    <n-form v-if="problem">
      <n-form-item label="题目标题">
        <n-input :value="problem.problem.title" disabled />
      </n-form-item>
      <n-form-item label="顺序">
        <n-input-number
          v-model:value="editProblemOrder"
          placeholder="题目在题单中的顺序"
        />
      </n-form-item>
      <n-form-item label="是否必做">
        <n-switch v-model:value="editProblemRequired" />
      </n-form-item>
      <n-form-item label="分数">
        <n-input-number
          v-model:value="editProblemScore"
          placeholder="题目分数"
        />
      </n-form-item>
      <n-form-item label="提示">
        <n-input
          v-model:value="editProblemHint"
          type="textarea"
          placeholder="题目提示"
        />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-flex justify="end">
        <n-button @click="handleCancel">取消</n-button>
        <n-button type="primary" @click="handleConfirm">确认</n-button>
      </n-flex>
    </template>
  </n-modal>
</template>

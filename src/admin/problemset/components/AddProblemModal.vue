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

interface Props {
  show: boolean
}

interface Emits {
  (e: "update:show", value: boolean): void
  (
    e: "confirm",
    data: {
      problem_id: string
      order: number
      is_required: boolean
      score: number
      hint: string
    },
  ): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const newProblemId = ref("")
const newProblemOrder = ref(0)
const newProblemRequired = ref(true)
const newProblemScore = ref(0)
const newProblemHint = ref("")

function handleConfirm() {
  emit("confirm", {
    problem_id: newProblemId.value,
    order: newProblemOrder.value,
    is_required: newProblemRequired.value,
    score: newProblemScore.value,
    hint: newProblemHint.value,
  })
}

function handleCancel() {
  emit("update:show", false)
}

// 重置表单
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      newProblemId.value = ""
      newProblemOrder.value = 0
      newProblemRequired.value = true
      newProblemScore.value = 0
      newProblemHint.value = ""
    }
  },
)
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    title="添加题目"
    style="width: 500px"
    @update:show="emit('update:show', $event)"
  >
    <n-form>
      <n-form-item label="题目ID" required>
        <n-input
          v-model:value="newProblemId"
          placeholder="请输入题目的显示ID（如：1001）"
        />
      </n-form-item>
      <n-form-item label="顺序">
        <n-input-number
          v-model:value="newProblemOrder"
          placeholder="题目在题单中的顺序"
        />
      </n-form-item>
      <n-form-item label="是否必做">
        <n-switch v-model:value="newProblemRequired" />
      </n-form-item>
      <n-form-item label="分数">
        <n-input-number
          v-model:value="newProblemScore"
          placeholder="题目分数"
        />
      </n-form-item>
      <n-form-item label="提示">
        <n-input
          v-model:value="newProblemHint"
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

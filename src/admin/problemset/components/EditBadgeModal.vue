<script setup lang="ts">
import { ProblemSetBadge } from "utils/types"

interface Props {
  show: boolean
  badge: ProblemSetBadge | null
}

interface Emits {
  (e: "update:show", value: boolean): void
  (
    e: "confirm",
    data: {
      name: string
      description: string
      icon: string
      condition_type: "all_problems" | "problem_count" | "score"
      condition_value?: number
    },
  ): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const editBadgeName = ref("")
const editBadgeDescription = ref("")
const editBadgeIcon = ref("")
const editBadgeConditionType = ref<"all_problems" | "problem_count" | "score">(
  "all_problems",
)
const editBadgeConditionValue = ref(1)

// 预设奖章图标选项
const badgeIconOptions = [
  { label: "奖章1", value: "/badge-1.png", icon: "/badge-1.png" },
  { label: "奖章2", value: "/badge-2.png", icon: "/badge-2.png" },
  { label: "奖章3", value: "/badge-3.png", icon: "/badge-3.png" },
  { label: "奖章4", value: "/badge-4.png", icon: "/badge-4.png" },
  { label: "奖章5", value: "/badge-5.png", icon: "/badge-5.png" },
]

const conditionTypeOptions = [
  { label: "完成所有题目", value: "all_problems" },
  { label: "完成指定数量题目", value: "problem_count" },
  { label: "达到指定分数", value: "score" },
]

function handleConfirm() {
  const data: any = {
    name: editBadgeName.value,
    description: editBadgeDescription.value,
    icon: editBadgeIcon.value,
    condition_type: editBadgeConditionType.value,
  }

  // 只有非"完成所有题目"时才添加条件值
  if (editBadgeConditionType.value !== "all_problems") {
    data.condition_value = editBadgeConditionValue.value
  }

  emit("confirm", data)
}

function handleCancel() {
  emit("update:show", false)
}

// 当奖章数据变化时，更新表单数据
watch(
  () => props.badge,
  (newBadge) => {
    if (newBadge) {
      editBadgeName.value = newBadge.name
      editBadgeDescription.value = newBadge.description
      editBadgeIcon.value = newBadge.icon
      editBadgeConditionType.value = newBadge.condition_type
      editBadgeConditionValue.value = newBadge.condition_value
    }
  },
  { immediate: true },
)
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    title="编辑奖章"
    style="width: 500px"
    @update:show="emit('update:show', $event)"
  >
    <n-form v-if="badge">
      <n-form-item label="奖章名称" required>
        <n-input v-model:value="editBadgeName" placeholder="请输入奖章名称" />
      </n-form-item>
      <n-form-item label="描述">
        <n-input
          v-model:value="editBadgeDescription"
          type="textarea"
          placeholder="奖章描述"
        />
      </n-form-item>
      <n-form-item label="图标" required>
        <n-flex align="center" gap="small">
          <div
            v-for="option in badgeIconOptions"
            :key="option.value"
            @click="editBadgeIcon = option.value"
            :style="{
              width: '60px',
              height: '60px',
              border:
                editBadgeIcon === option.value
                  ? '2px solid #1890ff'
                  : '1px solid #d9d9d9',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor:
                editBadgeIcon === option.value ? '#f0f8ff' : 'transparent',
            }"
          >
            <n-image
              :src="option.icon"
              width="50"
              height="50"
              object-fit="cover"
              style="border-radius: 2px"
              preview-disabled
            />
          </div>
        </n-flex>
      </n-form-item>
      <n-flex align="center">
        <n-form-item label="获得条件">
          <n-select
            style="width: 200px"
            v-model:value="editBadgeConditionType"
            :options="conditionTypeOptions"
          />
        </n-form-item>
        <n-form-item
          label="条件值"
          v-if="editBadgeConditionType !== 'all_problems'"
        >
          <n-input-number
            style="width: 120px"
            v-model:value="editBadgeConditionValue"
            placeholder="条件值"
          />
        </n-form-item>
      </n-flex>
    </n-form>
    <template #footer>
      <n-flex justify="end">
        <n-button @click="handleCancel">取消</n-button>
        <n-button type="primary" @click="handleConfirm">确认</n-button>
      </n-flex>
    </template>
  </n-modal>
</template>

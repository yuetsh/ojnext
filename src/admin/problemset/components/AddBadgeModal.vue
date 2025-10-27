<script setup lang="ts">
interface Props {
  show: boolean
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

const newBadgeName = ref("")
const newBadgeDescription = ref("")
const newBadgeIcon = ref("")
const newBadgeConditionType = ref<"all_problems" | "problem_count" | "score">(
  "all_problems",
)
const newBadgeConditionValue = ref(1)

const BADGE_LEN = 6
const badgeIconOptions = []
for (let i = 1; i <= BADGE_LEN; i++) {
  badgeIconOptions.push({
    label: `奖章${i}`,
    value: `/badge-${i}.png`,
    icon: `/badge-${i}.png`,
  })
}

const conditionTypeOptions = [
  { label: "完成所有题目", value: "all_problems" },
  { label: "完成指定数量题目", value: "problem_count" },
  { label: "达到指定分数", value: "score" },
]

function handleConfirm() {
  const data: any = {
    name: newBadgeName.value,
    description: newBadgeDescription.value,
    icon: newBadgeIcon.value,
    condition_type: newBadgeConditionType.value,
  }

  // 只有非"完成所有题目"时才添加条件值
  if (newBadgeConditionType.value !== "all_problems") {
    data.condition_value = newBadgeConditionValue.value
  }

  emit("confirm", data)
}

function handleCancel() {
  emit("update:show", false)
}

// 重置表单
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      newBadgeName.value = ""
      newBadgeDescription.value = ""
      newBadgeIcon.value = ""
      newBadgeConditionType.value = "all_problems"
      newBadgeConditionValue.value = 1
    }
  },
)
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    title="添加奖章"
    style="width: 500px"
    @update:show="emit('update:show', $event)"
  >
    <n-form>
      <n-form-item label="奖章名称" required>
        <n-input v-model:value="newBadgeName" placeholder="请输入奖章名称" />
      </n-form-item>
      <n-form-item label="描述">
        <n-input
          v-model:value="newBadgeDescription"
          type="textarea"
          placeholder="奖章描述"
          required
        />
      </n-form-item>
      <n-form-item label="图标" required>
        <n-flex align="center" gap="small">
          <div
            v-for="option in badgeIconOptions"
            :key="option.value"
            @click="newBadgeIcon = option.value"
            :style="{
              width: '60px',
              height: '60px',
              border:
                newBadgeIcon === option.value
                  ? '2px solid #1890ff'
                  : '1px solid #d9d9d9',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor:
                newBadgeIcon === option.value ? '#f0f8ff' : 'transparent',
            }"
          >
            <n-image
              :src="option.icon"
              width="50"
              height="50"
              object-fit="cover"
              preview-disabled
              style="border-radius: 2px"
            />
          </div>
        </n-flex>
      </n-form-item>
      <n-flex align="center">
        <n-form-item label="获得条件">
          <n-select
            style="width: 200px"
            v-model:value="newBadgeConditionType"
            :options="conditionTypeOptions"
          />
        </n-form-item>
        <n-form-item
          label="条件值"
          v-if="newBadgeConditionType !== 'all_problems'"
        >
          <n-input-number
            style="width: 120px"
            v-model:value="newBadgeConditionValue"
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

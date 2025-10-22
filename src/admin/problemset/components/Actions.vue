<script lang="ts" setup>
import { deleteProblemSet, updateProblemSetStatus } from "admin/api"

interface Props {
  problemSetId: number
}
const props = defineProps<Props>()
const emit = defineEmits(["updated"])

const router = useRouter()
const message = useMessage()

const showStatusModal = ref(false)
const newStatus = ref<"active" | "archived" | "draft">("active")

const statusOptions = [
  { label: "活跃", value: "active" },
  { label: "已归档", value: "archived" },
  { label: "草稿", value: "draft" },
]

async function handleDeleteProblemSet() {
  try {
    await deleteProblemSet(props.problemSetId)
    message.success("删除成功")
    emit("updated")
  } catch (err: any) {
    message.error("删除失败：" + (err.data || "未知错误"))
  }
}

function goEdit() {
  router.push({
    name: "admin problemset edit",
    params: { problemSetId: props.problemSetId },
  })
}

function goDetail() {
  router.push({
    name: "admin problemset detail",
    params: { problemSetId: props.problemSetId },
  })
}

function openStatusModal() {
  showStatusModal.value = true
}

async function handleUpdateStatus() {
  try {
    await updateProblemSetStatus(props.problemSetId, newStatus.value)
    message.success("状态更新成功")
    showStatusModal.value = false
    emit("updated")
  } catch (err: any) {
    message.error("状态更新失败：" + (err.data || "未知错误"))
  }
}
</script>

<template>
  <n-flex>
    <n-button size="small" secondary type="primary" @click="goEdit">
      编辑
    </n-button>
    <n-button size="small" secondary type="info" @click="goDetail">
      详情
    </n-button>
    <n-button size="small" secondary type="warning" @click="openStatusModal">
      状态
    </n-button>
    <n-popconfirm @positive-click="handleDeleteProblemSet">
      <template #trigger>
        <n-button secondary size="small" type="error">删除</n-button>
      </template>
      确定删除这个题单吗？删除后题单将不可见。
    </n-popconfirm>
  </n-flex>

  <n-modal
    v-model:show="showStatusModal"
    preset="card"
    title="更新题单状态"
    style="width: 400px"
  >
    <n-space vertical>
      <n-form>
        <n-form-item label="状态" required>
          <n-select
            v-model:value="newStatus"
            :options="statusOptions"
            placeholder="选择状态"
          />
        </n-form-item>
      </n-form>
    </n-space>
    <template #footer>
      <n-flex justify="end">
        <n-button @click="showStatusModal = false">取消</n-button>
        <n-button type="primary" @click="handleUpdateStatus">确认</n-button>
      </n-flex>
    </template>
  </n-modal>
</template>

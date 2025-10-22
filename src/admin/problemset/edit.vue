<script setup lang="ts">
import { CreateProblemSetData, EditProblemSetData } from "utils/types"
import { getProblemSetDetail, createProblemSet, editProblemSet } from "../api"

const route = useRoute()
const router = useRouter()
const message = useMessage()

const problemSetId = computed(() => Number(route.params.problemSetId))
const isEdit = computed(() => !!problemSetId.value)

const formData = ref<CreateProblemSetData & Partial<EditProblemSetData>>({
  title: "",
  description: "",
  difficulty: "Easy",
  status: "draft",
  visible: false,
})

const difficultyOptions = [
  { label: "简单", value: "Easy" },
  { label: "中等", value: "Medium" },
  { label: "困难", value: "Hard" },
]

const statusOptions = [
  { label: "活跃", value: "active" },
  { label: "已归档", value: "archived" },
  { label: "草稿", value: "draft" },
]

const loading = ref(false)

async function loadProblemSetDetail() {
  if (!isEdit.value) return

  try {
    const res = await getProblemSetDetail(problemSetId.value)
    const data = res.data
    formData.value = {
      id: data.id,
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      status: data.status,
      visible: data.visible,
    }
  } catch (err: any) {
    message.error("加载题单详情失败：" + (err.data || "未知错误"))
  }
}

async function handleSubmit() {
  if (!formData.value.title?.trim()) {
    message.error("请输入题单标题")
    return
  }

  if (!formData.value.description?.trim()) {
    message.error("请输入题单描述")
    return
  }

  loading.value = true

  try {
    if (isEdit.value) {
      await editProblemSet(formData.value as EditProblemSetData)
      message.success("题单更新成功")
    } else {
      await createProblemSet(formData.value as CreateProblemSetData)
      message.success("题单创建成功")
    }
    router.push({ name: "admin problemset list" })
  } catch (err: any) {
    message.error(
      (isEdit.value ? "更新" : "创建") +
        "题单失败：" +
        (err.data || "未知错误"),
    )
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (isEdit.value) {
    loadProblemSetDetail()
  }
})
</script>

<template>
  <div>
    <h2 class="title">{{ isEdit ? "编辑题单" : "创建题单" }}</h2>

    <n-form :model="formData" label-placement="top">
      <n-flex>
        <n-form-item label="题单标题" required>
          <n-input
            v-model:value="formData.title"
            placeholder="请输入题单标题"
            maxlength="200"
            show-count
          />
        </n-form-item>
        <n-form-item label="难度">
          <n-select
            style="width: 100px"
            v-model:value="formData.difficulty"
            :options="difficultyOptions"
            placeholder="选择难度"
          />
        </n-form-item>
        <n-form-item label="状态">
          <n-select
            style="width: 100px"
            v-model:value="formData.status"
            :options="statusOptions"
            placeholder="选择状态"
          />
        </n-form-item>
        <n-form-item v-if="isEdit" label="是否可见">
          <n-switch v-model:value="formData.visible" />
        </n-form-item>
      </n-flex>

      <n-form-item label="题单描述" required>
        <n-input
          v-model:value="formData.description"
          type="textarea"
          placeholder="请输入题单描述"
          :rows="4"
        />
      </n-form-item>
      <n-form-item>
        <n-button type="primary" :loading="loading" @click="handleSubmit">
          {{ isEdit ? "更新" : "创建" }}
        </n-button>
      </n-form-item>
    </n-form>
  </div>
</template>

<style scoped>
.title {
  margin: 0 0 16px 0;
}
</style>

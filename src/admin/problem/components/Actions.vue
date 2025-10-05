<script lang="ts" setup>
import {
  deleteContestProblem,
  deleteProblem,
  makeProblemPublic,
} from "admin/api"
import download from "utils/download"

interface Props {
  problemID: number
  problemDisplayID: string
}
const props = defineProps<Props>()
const emit = defineEmits(["updated"])

const route = useRoute()
const router = useRouter()
const message = useMessage()

const isContestProblem = computed(
  () => route.name === "admin contest problem list",
)

const showMakePublicModal = ref(false)
const newDisplayID = ref("")

async function handleDeleteProblem() {
  try {
    if (route.name === "admin contest problem list") {
      await deleteContestProblem(props.problemID)
    } else {
      await deleteProblem(props.problemID)
    }
    message.success("删除成功")
    emit("updated")
  } catch (err: any) {
    if (err.data === "Can't delete the problem as it has submissions") {
      message.error("这道题有提交之后，就不能被删除")
    } else {
      message.error("删除失败")
    }
  }
}

function downloads() {
  download("test_case?problem_id=" + props.problemID)
}

function goEdit() {
  const name = route.name!.toString().replace("list", "edit")
  router.push({ name, params: { problemID: props.problemID } })
}

function goCheck() {
  let data = router.resolve("/problem/" + props.problemDisplayID)
  if (route.name === "admin contest problem list") {
    data = router.resolve({
      name: "contest problem",
      params: {
        contestID: route.params.contestID,
        problemID: props.problemDisplayID,
      },
    })
  }
  window.open(data.href, "_blank")
}

function openMakePublicModal() {
  newDisplayID.value = ""
  showMakePublicModal.value = true
}

async function handleMakePublic() {
  if (!newDisplayID.value.trim()) {
    message.error("请输入新的题目编号")
    return
  }

  try {
    await makeProblemPublic(props.problemID, newDisplayID.value.trim())
    message.success("已成功转为公开题目（需要手动设置可见）")
    showMakePublicModal.value = false
    emit("updated") // 刷新列表
  } catch (err: any) {
    if (err.data === "Duplicate display ID") {
      message.error("该题目编号已存在，请使用其他编号")
    } else if (err.data === "Already be a public problem") {
      message.error("该题目已经是公开题目")
    } else {
      message.error("转换失败：" + (err.data || "未知错误"))
    }
  }
}
</script>
<template>
  <n-flex>
    <n-button size="small" secondary type="primary" @click="goEdit">
      编辑
    </n-button>
    <n-button size="small" secondary type="info" @click="goCheck">
      查看
    </n-button>
    <n-tooltip v-if="isContestProblem">
      <template #trigger>
        <n-button
          size="small"
          secondary
          type="warning"
          @click="openMakePublicModal"
        >
          公开
        </n-button>
      </template>
      将此竞赛题目转为公开题目
    </n-tooltip>
    <n-popconfirm @positive-click="handleDeleteProblem">
      <template #trigger>
        <n-button secondary size="small" type="error">删除</n-button>
      </template>
      确定删除这道题目吗？相关的提交也会被相应删除哦 😯
    </n-popconfirm>
    <n-tooltip>
      <template #trigger>
        <n-button size="small" secondary @click="downloads">下载</n-button>
      </template>
      下载测试用例
    </n-tooltip>
  </n-flex>

  <n-modal
    v-model:show="showMakePublicModal"
    preset="card"
    title="转为公开题目"
    style="width: 500px"
  >
    <n-space vertical>
      <p>
        将竞赛题目转为公开题目后，会创建一个新的公开题目副本，原题目保持不变。
      </p>
      <n-form>
        <n-form-item label="新的题目编号" required>
          <n-input
            v-model:value="newDisplayID"
            placeholder="例如: 1001"
            clearable
            @keyup.enter="handleMakePublic"
          />
        </n-form-item>
      </n-form>
      <n-alert type="info" title="提示：请输入一个未被使用的题目编号">
      </n-alert>
    </n-space>
    <template #footer>
      <n-flex justify="end">
        <n-button @click="showMakePublicModal = false">取消</n-button>
        <n-button type="primary" @click="handleMakePublic">确认</n-button>
      </n-flex>
    </template>
  </n-modal>
</template>

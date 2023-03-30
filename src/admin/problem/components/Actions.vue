<script lang="ts" setup>
import { deleteContestProblem, deleteProblem } from "~/admin/api"
import download from "~/utils/download"

interface Props {
  problemID: number
  problemDisplayID: string
}
const props = defineProps<Props>()
const emit = defineEmits(["deleted"])

const route = useRoute()
const router = useRouter()
const message = useMessage()

async function handleDeleteProblem() {
  try {
    if (route.name === "admin contest problem list") {
      await deleteContestProblem(props.problemID)
    } else {
      await deleteProblem(props.problemID)
    }
    message.success("删除成功")
    emit("deleted")
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
  const data = router.resolve("/problem/" + props.problemDisplayID)
  window.open(data.href, "_blank")
}
</script>
<template>
  <n-space align="center">
    <n-button size="small" secondary type="primary" @click="goEdit">
      编辑
    </n-button>
    <n-button size="small" secondary type="info" @click="goCheck">
      查看
    </n-button>
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
  </n-space>
</template>

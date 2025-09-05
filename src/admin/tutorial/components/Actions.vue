<script lang="ts" setup>
import { deleteTutorial } from "~/admin/api"

interface Props {
  tutorialID: number
}

const props = defineProps<Props>()
const emit = defineEmits(["deleted"])
const router = useRouter()
const message = useMessage()

function goEdit() {
  router.push({
    name: "admin tutorial edit",
    params: { tutorialID: props.tutorialID },
  })
}

async function handleDelete() {
  try {
    await deleteTutorial(props.tutorialID)
    message.success("删除成功")
    emit("deleted")
  } catch (err: any) {
    message.error(err.data)
  }
}
</script>
<template>
  <n-flex>
    <n-button size="small" type="success" secondary @click="goEdit">
      编辑
    </n-button>
    <n-popconfirm @positive-click="handleDelete">
      <template #trigger>
        <n-button size="small" type="error" secondary>删除</n-button>
      </template>
      确定删除这个教程吗？
    </n-popconfirm>
  </n-flex>
</template>
<style scoped></style>

<script lang="ts" setup>
import { deleteAnnouncement } from "~/admin/api"

interface Props {
  announcementID: number
}

const props = defineProps<Props>()
const emit = defineEmits(["deleted"])
const router = useRouter()
const message = useMessage()

function goEdit() {
  router.push({
    name: "admin announcement edit",
    params: { announcementID: props.announcementID },
  })
}

async function handleDelete() {
  await deleteAnnouncement(props.announcementID)
  message.success("删除成功")
  emit("deleted")
}

</script>
<template>
  <n-space>
    <n-button size="small" type="success" secondary @click="goEdit">
      编辑
    </n-button>
    <n-popconfirm @positive-click="handleDelete">
      <template #trigger>
        <n-button size="small" type="error" secondary>删除</n-button>
      </template>
      确定删除这条公告吗？
    </n-popconfirm>
  </n-space>
</template>
<style scoped></style>

<template>
  <n-button v-if="showLink" type="info" text @click="handleClick">
    {{ flowchart.id.slice(0, 12) }}
  </n-button>
  <n-text v-else class="flowchart-id" @click="handleClick">
    {{ flowchart.id.slice(0, 12) }}
  </n-text>
</template>
<script setup lang="ts">
import type { FlowchartSubmissionListItem } from "utils/types"
import { useUserStore } from "shared/store/user"

const userStore = useUserStore()

interface Props {
  flowchart: FlowchartSubmissionListItem
}
const props = defineProps<Props>()

const emit = defineEmits<{
  showDetail: [id: string]
}>()

const showLink = computed(() => {
  if (!userStore.isAuthed) return false
  if (userStore.isSuperAdmin) return true
  return props.flowchart.username === userStore.user?.username
})

function handleClick() {
  emit("showDetail", props.flowchart.id)
}
</script>

<style scoped></style>

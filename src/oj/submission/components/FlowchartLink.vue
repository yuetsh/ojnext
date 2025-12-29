<template>
  <n-button v-if="showLink" type="info" text @click="goto">
    {{ flowchart.id.slice(0, 12) }}
  </n-button>
  <n-text v-else class="flowchart-id" @click="handleClick">
    {{ flowchart.id.slice(0, 12) }}
  </n-text>
</template>
<script setup lang="ts">
import { useUserStore } from "shared/store/user"
import { FlowchartSubmissionListItem } from "utils/types"

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

function goto() {
  emit("showDetail", props.flowchart.id)
}

function handleClick() {
  emit("showDetail", props.flowchart.id)
}
</script>

<style scoped>
</style>

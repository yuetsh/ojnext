<template>
  <n-flex v-if="props.submission.show_link" align="center">
    <n-button text type="info" @click="$emit('showCode')">
      {{ props.submission.id.slice(0, 12) }}
    </n-button>
    <n-tooltip>
      <template #trigger>
        <n-button text @click="goto">
          <template #icon>
            <Icon icon="catppuccin:folder-debug"></Icon>
          </template>
        </n-button>
      </template>
      查看测试详情
    </n-tooltip>
  </n-flex>
  <span v-else>
    {{ props.submission.id.slice(0, 12) }}
  </span>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { SubmissionListItem } from "~/utils/types"

interface Props {
  submission: SubmissionListItem
}
const props = defineProps<Props>()
defineEmits(["showCode"])

function goto() {
  window.open("/submission/" + props.submission.id, "_blank")
}
</script>

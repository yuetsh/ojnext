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
  <n-flex v-else-if="isOwnSubmission" align="center">
    <span>{{ props.submission.id.slice(0, 12) }}</span>
    <n-tooltip>
      <template #trigger>
        <n-button text>
          <template #icon>
            <Icon icon="noto:locked"></Icon>
          </template>
        </n-button>
      </template>
      这道题在你已经加入的题单中，只有在题单中完成此题，代码才可见。
    </n-tooltip>
  </n-flex>
  <span v-else>{{ props.submission.id.slice(0, 12) }}</span>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { useUserStore } from "shared/store/user"
import type { SubmissionListItem } from "utils/types"

interface Props {
  submission: SubmissionListItem
}
const props = defineProps<Props>()
defineEmits(["showCode"])

const userStore = useUserStore()
const isOwnSubmission = computed(() => userStore.profile?.user?.id === props.submission.user_id)

function goto() {
  window.open("/submission/" + props.submission.id, "_blank")
}
</script>

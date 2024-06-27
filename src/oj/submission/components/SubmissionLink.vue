<template>
  <n-flex v-if="props.submission.show_link" align="center">
    <n-button text type="info" @click="$emit('showCode')">
      {{ props.submission.id.slice(0, 12) }}
    </n-button>
    <n-button text @click="goto">
      <template #icon>
        <Icon icon="streamline-emojis:backhand-index-pointing-right-1"></Icon>
      </template>
    </n-button>
  </n-flex>
  <span v-else>
    {{ props.submission.id.slice(0, 12) }}
  </span>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { Submission } from "~/utils/types"

interface Props {
  submission: Submission
}
const router = useRouter()
const props = defineProps<Props>()
defineEmits(["showCode"])

function goto() {
  router.push("/submission/" + props.submission.id)
}
</script>

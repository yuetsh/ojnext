<script setup lang="ts">
import { ContestRank } from "utils/types"

interface Props {
  rank: ContestRank
}
const props = defineProps<Props>()
const router = useRouter()

function goto() {
  router.push({
    name: "contest submissions",
    query: { username: props.rank.user.username },
  })
}
</script>

<template>
  {{ rank.accepted_number }} /
  <n-button text type="primary" @click="goto">
    {{ rank.submission_number }}
  </n-button>
</template>

<style scoped></style>

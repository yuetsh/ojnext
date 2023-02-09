<script setup lang="ts">
import { ContestRank } from "~/utils/types"

defineProps<{ rank: ContestRank }>()
</script>

<template>
  {{ rank.accepted_number }} /
  <n-button text type="primary">{{ rank.submission_number }}</n-button>
</template>

<style scoped></style>

<template>
  <n-select
    style="width: 140px"
    v-model:value="author"
    remote
    @update:show="getAuthorOptions"
    :options="authorOptions"
  />
</template>

<script setup lang="ts">
import { getAuthors } from "~/oj/api"

interface Props {
  all?: boolean
}

const { all = false } = defineProps<Props>()

const author = defineModel<string>("value")

const authorOptions = ref([{ label: "全部", value: "" }])

async function getAuthorOptions() {
  authorOptions.value = [{ label: "全部", value: "" }]
  const res = await getAuthors(all)
  const remotes = res.data.map(
    (item: { username: string; problem_count: number }) => ({
      label: `${item.username} (${item.problem_count})`,
      value: item.username,
    }),
  )
  authorOptions.value = [...authorOptions.value, ...remotes]
}
</script>

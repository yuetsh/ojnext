<template>
  <n-alert
    :show-icon="false"
    type="success"
    v-if="aiStore.detailsData.solved.length"
  >
    <span>{{ durationLabel }}，</span>
    <span>你一共解决 </span>
    <b class="charming"> {{ aiStore.detailsData.solved.length }} </b>
    <span> 道题</span>
    <span v-if="aiStore.detailsData.contest_count > 0">
      ，并且参加
      <b class="charming"> {{ aiStore.detailsData.contest_count }} </b>
      次比赛
    </span>
    <span>，综合评价给到</span>
    <Grade :grade="aiStore.detailsData.grade" />
    <span>{{ greeting }}</span>
  </n-alert>
  <n-flex vertical size="large" v-else>
    <n-alert type="error" title="你还没有完成任何题目">
      开始解题，看看你的学习能力吧！
    </n-alert>
    <AI />
  </n-flex>
</template>
<script lang="ts" setup>
import Grade from "./Grade.vue"
import { parseTime } from "utils/functions"
import { useAIStore } from "oj/store/ai"
import AI from "./AI.vue"

const aiStore = useAIStore()

const durationLabel = computed(() => {
  if (aiStore.duration.includes("hours")) {
    return `在 ${parseTime(aiStore.detailsData.start, "HH:mm")} - ${parseTime(aiStore.detailsData.end, "HH:mm")} 期间`
  } else if (aiStore.duration.includes("days")) {
    return `在 ${parseTime(aiStore.detailsData.end, "MM月DD日")}`
  } else if (
    aiStore.duration.includes("weeks") ||
    aiStore.duration.includes("months")
  ) {
    return `在 ${parseTime(aiStore.detailsData.start, "MM月DD日")} - ${parseTime(aiStore.detailsData.end, "MM月DD日")} 期间`
  } else {
    return `在 ${parseTime(aiStore.detailsData.start, "YYYY年MM月DD日")} - ${parseTime(aiStore.detailsData.end, "YYYY年MM月DD日")} 期间`
  }
})

const greeting = computed(() => {
  return {
    S: "要不试试高难度题目？",
    A: "你很棒，继续保持！",
    B: "请再接再厉！",
    C: "你还需要努力！",
  }[aiStore.detailsData.grade]
})
</script>
<style scoped>
.charming {
  font-size: 1.2rem;
}
</style>

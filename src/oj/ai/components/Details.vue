<template>
  <n-spin :show="aiStore.loading.details">
    <n-flex vertical size="large">
      <n-alert
        :show-icon="false"
        type="success"
        v-if="aiStore.detailsData.solved.length"
      >
        <span>{{ durationLabel }}，</span>
        <span>你一共解决 </span>
        <b class="charming"> {{ aiStore.detailsData.solved.length }} </b>
        <span> 道题，</span>
        <span v-if="aiStore.detailsData.contest_count > 0">
          并且参加
          <b class="charming"> {{ aiStore.detailsData.contest_count }} </b>
          次比赛，
        </span>
        <span>综合评价给到</span>
        <Grade :grade="aiStore.detailsData.grade" />
        <span>{{ greeting }}</span>
      </n-alert>
      <n-flex vertical size="large" v-else>
        <n-alert type="error" title="你还没有完成任何题目"></n-alert>
        <AI />
      </n-flex>
      <n-grid :cols="isDesktop ? 2 : 1" :x-gap="10" :y-gap="10">
        <n-gi>
          <TagsChart :tags="aiStore.detailsData.tags" />
        </n-gi>
        <n-gi>
          <DifficultyChart :difficulty="aiStore.detailsData.difficulty" />
        </n-gi>
      </n-grid>
      <n-data-table
        v-if="aiStore.detailsData.solved.length"
        striped
        :data="aiStore.detailsData.solved"
        :columns="columns"
      />
    </n-flex>
  </n-spin>
</template>
<script lang="ts" setup>
import { NButton } from "naive-ui"
import Grade from "./Grade.vue"
import TagsChart from "./TagsChart.vue"
import DifficultyChart from "./DifficultyChart.vue"
import TagTitle from "./TagTitle.vue"
import AI from "./AI.vue"
import { parseTime } from "~/utils/functions"
import { SolvedProblem } from "~/utils/types"
import { useAIStore } from "~/oj/store/ai"
import { isDesktop } from "~/shared/composables/breakpoints"

const props = defineProps<{
  start: string
  end: string
}>()

const router = useRouter()
const aiStore = useAIStore()

const columns: DataTableColumn<SolvedProblem>[] = [
  {
    title: "完成的题目",
    key: "problem.title",
    render: (row) =>
      h(
        NButton,
        {
          text: true,
          onClick: () => {
            if (row.problem.contest_id) {
              router.push(
                "/contest/" +
                  row.problem.contest_id +
                  "/problem/" +
                  row.problem.display_id,
              )
            } else {
              router.push("/problem/" + row.problem.display_id)
            }
          },
        },
        () => {
          if (row.problem.contest_id) {
            return h(TagTitle, { problem: row.problem })
          } else {
            return row.problem.display_id + " " + row.problem.title
          }
        },
      ),
  },
  {
    title: () => (aiStore.detailsData.class_name ? "班级排名" : "全服排名"),
    key: "rank",
    width: 100,
    align: "center",
    render: (row) => row.rank + " / " + row.ac_count,
  },
  {
    title: "等级",
    key: "grade",
    width: 100,
    align: "center",
  },
]

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

watch(
  () => aiStore.duration,
  () => {
    aiStore.fetchDetailsData(props.start, props.end)
  },
  { immediate: true },
)
</script>
<style scoped>
.charming {
  font-size: 1.2rem;
}
</style>

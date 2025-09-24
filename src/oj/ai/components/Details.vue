<template>
  <n-spin :show="detailLoading">
    <n-flex vertical size="large">
      <n-alert :show-icon="false" type="success" v-if="solvedProblems.length">
        <span>{{ durationLabel }}，</span>
        <span>{{ !!username ? username : "你" }}一共解决 </span>
        <b class="charming"> {{ solvedProblems.length }} </b>
        <span> 道题，</span>
        <span v-if="contest_count > 0">
          并且参加
          <b class="charming"> {{ contest_count }} </b> 次比赛，
        </span>
        <span>综合评价给到</span>
        <Grade :grade="grade" />
        <span>{{ greeting }}</span>
      </n-alert>
      <n-alert
        type="error"
        v-else
        :title="(!!username ? username : '你') + '还没有完成任何题目'"
      ></n-alert>
      <n-flex>
        <TagsChart :tags="tags" />
        <DifficultyChart :difficulty="difficulty" />
      </n-flex>
      <n-data-table
        v-if="solvedProblems.length"
        striped
        :max-height="400"
        :data="solvedProblems"
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
import { parseTime } from "~/utils/functions"
import { getAIDetailData } from "~/oj/api"

const props = defineProps<{
  start: string
  end: string
  duration: string
  username: string
}>()

const router = useRouter()

interface SolvedProblem {
  problem: {
    title: string
    display_id: string
    contest_title: string
    contest_id: number
  }
  ac_time: string
  rank: number
  ac_count: number
  grade: "S" | "A" | "B" | "C"
}

const detailLoading = ref(false)

const startLabel = ref("")
const endLabel = ref("")

const grade = ref<"S" | "A" | "B" | "C">("B")
const class_name = ref("")
const tags = ref<{ [key: string]: number }>({})
const difficulty = ref<{ [key: string]: number }>({})
const contest_count = ref(0)

const solvedProblems = ref<SolvedProblem[]>([])

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
    title: () => (class_name ? "班级排名" : "全服排名"),
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
  if (props.duration.includes("hours")) {
    return `在 ${parseTime(startLabel.value, "HH:mm")} - ${parseTime(endLabel.value, "HH:mm")} 期间`
  } else if (props.duration.includes("days")) {
    return `在 ${parseTime(endLabel.value, "MM月DD日")}`
  } else if (
    props.duration.includes("weeks") ||
    props.duration.includes("months")
  ) {
    return `在 ${parseTime(startLabel.value, "MM月DD日")} - ${parseTime(endLabel.value, "MM月DD日")} 期间`
  } else {
    return `在 ${parseTime(startLabel.value, "YYYY年MM月DD日")} - ${parseTime(endLabel.value, "YYYY年MM月DD日")} 期间`
  }
})

const greeting = computed(() => {
  return {
    S: "要不试试高难度题目？",
    A: "你很棒，继续保持！",
    B: "请再接再厉！",
    C: "你还需要努力！",
  }[grade.value]
})

async function getDetail() {
  detailLoading.value = true
  const res = await getAIDetailData(props.start, props.end, props.username)
  detailLoading.value = false

  startLabel.value = res.data.start
  endLabel.value = res.data.end
  solvedProblems.value = res.data.solved
  grade.value = res.data.grade
  class_name.value = res.data.class_name
  tags.value = res.data.tags
  difficulty.value = res.data.difficulty
  contest_count.value = res.data.contest_count
}

watch(() => [props.duration, props.username], getDetail, { immediate: true })
</script>
<style scoped>
.charming {
  font-size: 1.2rem;
}
</style>

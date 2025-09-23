<template>
  <n-grid :cols="5" :x-gap="20">
    <n-gi :span="2">
      <n-flex vertical size="large">
        <n-flex align="center">
          <n-select
            style="width: 140px"
            :options="options"
            v-model:value="duration"
          />
          <n-flex>
            <n-input
              clearable
              style="width: 140px"
              v-if="userStore.isSuperAdmin"
              v-model:value="username"
            />
            <n-button @click="init">查询</n-button>
          </n-flex>
        </n-flex>
        <n-spin :show="detailLoading">
          <n-flex vertical size="large">
            <n-alert
              :show-icon="false"
              type="success"
              v-if="solvedProblems.length"
            >
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
            <n-alert type="error" v-else title="你还没有完成任何题目"></n-alert>
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
      </n-flex>
    </n-gi>
    <n-gi :span="3">
      <n-spin :show="weeklyLoading">
        <WeeklyChart :weeklyData="weeklyData" :duration="duration" />
      </n-spin>
    </n-gi>
  </n-grid>
</template>
<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { formatISO, sub, type Duration } from "date-fns"
import { getAIDetailData, getAIWeeklyData } from "../api"
import { NButton } from "naive-ui"
import { parseTime } from "~/utils/functions"
import TagTitle from "./components/TagTitle.vue"
import TagsChart from "./components/TagsChart.vue"
import DifficultyChart from "./components/DifficultyChart.vue"
import WeeklyChart from "./components/WeeklyChart.vue"
import Grade from "./components/Grade.vue"
import { WeeklyData } from "~/utils/types"
import { useUserStore } from "~/shared/store/user"

const router = useRouter()
const userStore = useUserStore()

const start = ref("")
const end = ref("")
const duration = ref("months:6")
const username = ref("")

const startLabel = ref("")
const endLabel = ref("")

const weeklyLoading = ref(false)
const detailLoading = ref(false)

const durationLabel = computed(() => {
  if (duration.value.includes("hours")) {
    return `在 ${parseTime(startLabel.value, "HH:mm")} - ${parseTime(endLabel.value, "HH:mm")} 期间`
  } else if (duration.value.includes("days")) {
    return `在 ${parseTime(endLabel.value, "MM月DD日")}`
  } else if (
    duration.value.includes("weeks") ||
    duration.value.includes("months")
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

const solvedProblems = ref<SolvedProblem[]>([])
const grade = ref<"S" | "A" | "B" | "C">("B")
const class_name = ref("")
const tags = ref<{ [key: string]: number }>({})
const difficulty = ref<{ [key: string]: number }>({})
const contest_count = ref(0)
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

const options: SelectOption[] = [
  { label: "一节课内", value: "hours:1" },
  { label: "两节课内", value: "hours:2" },
  { label: "一天内", value: "days:1" },
  { label: "一周内", value: "weeks:1" },
  { label: "一个月内", value: "months:1" },
  { label: "两个月内", value: "months:2" },
  { label: "半年内", value: "months:6" },
  { label: "一年内", value: "years:1" },
]

const subOptions = computed<Duration>(() => {
  let dur = options.find((it) => it.value === duration.value) ?? options[0]
  const x = dur.value!.toString().split(":")
  const unit = x[0]
  const n = x[1]
  return { [unit]: parseInt(n) } as Duration
})

function updateRange() {
  const current = new Date()
  end.value = formatISO(current)
  start.value = formatISO(sub(current, subOptions.value))
}

async function getDetail() {
  detailLoading.value = true
  const res = await getAIDetailData(start.value, end.value, username.value)
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

const weeklyData = ref<WeeklyData[]>([])

async function getWeeklyData() {
  weeklyLoading.value = true
  const res = await getAIWeeklyData(end.value, duration.value, username.value)
  weeklyData.value = res.data
  weeklyLoading.value = false
}

function init() {
  updateRange()
  getDetail()
  getWeeklyData()
}
watch(duration, init, { immediate: true })
</script>
<style scoped>
.charming {
  font-size: 1.2rem;
}
</style>

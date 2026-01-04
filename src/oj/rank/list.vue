<script setup lang="ts">
import { formatISO, sub, type Duration } from "date-fns"
import { NButton, NFlex, useThemeVars } from "naive-ui"
import {
  getActivityRank,
  getClassRank,
  getRank,
  getUserClassRank,
} from "oj/api"
import { useBreakpoints } from "shared/composables/breakpoints"
import { getACRate } from "utils/functions"
import { Rank } from "utils/types"
import Pagination from "shared/components/Pagination.vue"
import { ChartType } from "utils/constants"
import { renderTableTitle } from "utils/renders"
import Chart from "./components/Chart.vue"
import Index from "./components/Index.vue"
import { useUserStore } from "shared/store/user"
import { Icon } from "@iconify/vue"

const gradeOptions = [
  { label: "24年级", value: 24 },
  { label: "23年级", value: 23 },
  { label: "22年级", value: 22 },
  { label: "21年级", value: 21 },
  { label: "20年级", value: 20 },
]

const router = useRouter()
const userStore = useUserStore()
const { isDesktop } = useBreakpoints()
const data = ref<Rank[]>([])
const total = ref(0)
const query = reactive({
  limit: 10,
  page: 1,
})
const rankChart = ref<Rank[]>([])
const activityChart = ref<Rank[]>([])
const duration = ref("months:1")
const classData = ref<ClassRank[]>([])
const classQuery = reactive({
  grade: gradeOptions[0].value,
})
const myClassData = ref<UserRank[]>([])
const myRank = ref(-1)
const myClassName = ref("")
const myClassScope = ref<"window" | "all">("window")
const myClassTotal = ref(0)
const myClassQuery = reactive({
  page: 1,
  limit: 10,
})

interface ClassRank {
  rank: number
  class_name: string
  user_count: number
  total_ac: number
  total_submission: number
  avg_ac: number
  ac_rate: number
}

interface UserRank {
  rank: number
  username: string
  accepted_number: number
  submission_number: number
}

async function init() {
  const offset = (query.page - 1) * query.limit
  const res = await getRank(offset, query.limit, 100)
  data.value = res.data.results
  total.value = res.data.total
  return res.data.results
}

const columns: DataTableColumn<Rank>[] = [
  {
    title: renderTableTitle("排名", "streamline-emojis:flexed-biceps-1"),
    key: "index",
    width: 100,
    align: "center",
    render: (_, index) =>
      h(Index, { index, page: query.page, limit: query.limit }),
  },
  {
    title: renderTableTitle(
      "用户",
      "streamline-emojis:smiling-face-with-sunglasses",
    ),
    key: "username",
    width: 200,
    render: (row) =>
      h(
        NButton,
        {
          text: true,
          type: "info",
          onClick: () => router.push("/user?name=" + row.user.username),
        },
        () => row.user.username,
      ),
  },
  {
    title: renderTableTitle(
      "个性签名",
      "streamline-emojis:no-one-under-eighteen",
    ),
    key: "mood",
    minWidth: 200,
  },
  {
    title: renderTableTitle("已解决", "streamline-emojis:raised-fist-1"),
    key: "accepted_number",
    width: 120,
    align: "center",
  },
  {
    title: renderTableTitle("提交数", "streamline-emojis:rocket"),
    key: "submission_number",
    width: 120,
    align: "center",
  },
  {
    title: renderTableTitle("正确率", "streamline-emojis:wrapped-gift-1"),
    key: "rate",
    width: 120,
    align: "center",
    render: (row) => getACRate(row.accepted_number, row.submission_number),
  },
]

watch(() => query.page, init)
watch(
  () => query.limit,
  () => {
    query.page = 1
    init()
  },
)
watch(duration, listActivity)

async function listActivity() {
  const current = Date.now()
  const start = formatISO(sub(current, subOptions.value))
  const res = await getActivityRank(start)
  activityChart.value = res.data.map(
    (d: { username: string; count: number }) => ({
      user: {
        username: d.username,
      },
      accepted_number: d.count,
      submission_number: 0,
    }),
  )
}

async function listRank() {
  const res = await getRank(0, 10, 10)
  rankChart.value = res.data.results
}

const options: SelectOption[] = [
  { label: "一周内", value: "weeks:1" },
  { label: "一个月内", value: "months:1" },
  { label: "两个月内", value: "months:2" },
  { label: "半年内", value: "months:6" },
  { label: "一年内", value: "years:1" },
]

const subOptions = computed<Duration>(() => {
  let dur = options.find((it) => it.value === duration.value) ?? options[1]
  const x = dur.value!.toString().split(":")
  const unit = x[0]
  const n = x[1]
  return { [unit]: parseInt(n) }
})

onMounted(() => {
  init()
  listRank()
  listActivity()
  listClassRank()
  listMyClassRank()
})

const classColumns: DataTableColumn<ClassRank>[] = [
  {
    title: "排名",
    key: "rank",
    width: 100,
    titleAlign: "center",
    align: "center",
  },
  {
    title: "班级",
    key: "class_name",
    render: (row) => `${row.class_name.slice(0, 2)}计算机${row.class_name.slice(2)}班`,
    width: 200,
    titleAlign: "center",
    align: "center",
  },
  {
    title: "人数",
    key: "user_count",
    width: 100,
    titleAlign: "center",
    align: "center",
  },
  {
    title: "总AC数",
    key: "total_ac",
    width: 120,
    titleAlign: "center",
    align: "center",
  },
  {
    title: "总提交数",
    key: "total_submission",
    width: 120,
    titleAlign: "center",
    align: "center",
  },
  {
    title: "平均AC数",
    key: "avg_ac",
    width: 120,
    titleAlign: "center",
    align: "center",
  },
  {
    title: "正确率",
    key: "ac_rate",
    width: 100,
    titleAlign: "center",
    align: "center",
    render: (row) => `${row.ac_rate}%`,
  },
]

const myClassColumns: DataTableColumn<UserRank>[] = [
  {
    title: "排名",
    key: "rank",
    width: 100,
    align: "center",
  },
  {
    title: "用户名",
    key: "username",
    width: 200,
    render: (row) =>
      h(
        NButton,
        {
          text: true,
          type: "info",
          onClick: () => router.push("/user?name=" + row.username),
        },
        () =>
          row.rank === myRank.value
            ? h(
                NFlex,
                { align: "flex-end" },
                {
                  default: () => [
                    h("span", {}, row.username),
                    h(Icon, {
                      width: 20,
                      icon: "fluent-emoji:person-raising-hand",
                    }),
                  ],
                },
              )
            : row.username,
      ),
  },
  {
    title: "已解决",
    key: "accepted_number",
    width: 120,
    align: "center",
  },
  {
    title: "提交数",
    key: "submission_number",
    width: 120,
    align: "center",
  },
]

async function listClassRank() {
  if (!userStore.user) {
    await userStore.getMyProfile()
  }
  const className = userStore.user?.class_name
  if (className) {
    classQuery.grade = parseInt(className.slice(0, 2))
  }
  const res = await getClassRank(classQuery.grade)
  classData.value = res.data
}

async function listMyClassRank() {
  try {
    const offset =
      myClassScope.value === "all"
        ? (myClassQuery.page - 1) * myClassQuery.limit
        : 0
    const limit = myClassScope.value === "all" ? myClassQuery.limit : undefined
    const res = await getUserClassRank(myClassScope.value, offset, limit)
    myRank.value = res.data.my_rank
    myClassName.value = res.data.class_name
    myClassData.value = res.data.ranks
    myClassTotal.value = res.data.total ?? res.data.ranks.length
    if (myClassScope.value === "window") {
      myClassQuery.page = 1
    }
  } catch (err: any) {
    console.error(err)
  }
}

watch(
  () => classQuery.grade,
  () => {
    listClassRank()
  },
)

watch(myClassScope, listMyClassRank)

watch(
  () => myClassQuery.page,
  () => {
    if (myClassScope.value === "all") {
      listMyClassRank()
    }
  },
)

watch(
  () => myClassQuery.limit,
  () => {
    myClassQuery.page = 1
    if (myClassScope.value === "all") {
      listMyClassRank()
    }
  },
)
</script>

<template>
  <n-flex vertical size="large">
    <n-grid :cols="isDesktop ? 2 : 1" :x-gap="20" :y-gap="20">
      <n-gi :span="1">
        <n-card>
          <template #header>
            <div style="height: 34px">全服 Top10</div>
          </template>
          <Chart
            v-if="rankChart.length"
            :type="ChartType.Rank"
            :rank-data="rankChart"
          />
          <n-empty v-else style="padding: 20px 0"></n-empty>
        </n-card>
      </n-gi>
      <n-gi :span="1">
        <n-card>
          <template #header>日活 Top10</template>
          <template #header-extra>
            <n-select
              style="width: 120px"
              :options="options"
              v-model:value="duration"
            />
          </template>
          <Chart
            v-if="activityChart.length"
            :type="ChartType.Activity"
            :rank-data="activityChart"
          />
          <n-empty v-else style="padding: 20px 0"></n-empty>
        </n-card>
      </n-gi>
    </n-grid>
    <n-card>
      <template #header>全服 Top100</template>
      <n-data-table :data="data" :columns="columns" />
      <template #footer>
        <Pagination
          :total="total"
          v-model:page="query.page"
          v-model:limit="query.limit"
        />
      </template>
    </n-card>
    <n-grid :cols="isDesktop ? 2 : 1" :x-gap="20" :y-gap="20">
      <n-gi :span="1">
        <n-card>
          <template #header>班级排名</template>
          <template #header-extra>
            <n-select
              v-model:value="classQuery.grade"
              placeholder="选择年级"
              clearable
              style="width: 180px"
              :options="gradeOptions"
            />
          </template>
          <n-data-table :data="classData" :columns="classColumns" />
        </n-card>
      </n-gi>
      <n-gi :span="1">
        <n-card>
          <template #header>我在班级的排名</template>
          <template #header-extra>
            <n-select
              style="width: 180px"
              :options="[
                { label: '我的位置', value: 'window' },
                { label: '全班排名', value: 'all' },
              ]"
              v-model:value="myClassScope"
            />
          </template>
          <n-data-table :data="myClassData" :columns="myClassColumns" />
          <template #footer v-if="myClassScope === 'all'">
            <Pagination
              :total="myClassTotal"
              v-model:page="myClassQuery.page"
              v-model:limit="myClassQuery.limit"
            />
          </template>
        </n-card>
      </n-gi>
    </n-grid>
  </n-flex>
</template>

<style scoped></style>

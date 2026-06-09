<script setup lang="ts">
import { formatISO, sub, type Duration } from "date-fns"
import { NButton, NFlex } from "naive-ui"
import {
  getActivityRank,
  getClassRank,
  getRank,
  getUserClassRank,
  getClassPK,
} from "oj/api"
import { useBreakpoints } from "shared/composables/breakpoints"
import { getACRate, getCSRFToken } from "utils/functions"
import type { Rank } from "utils/types"
import Pagination from "shared/components/Pagination.vue"
import { ChartType } from "utils/constants"
import { renderTableTitle } from "utils/renders"
import Chart from "./components/Chart.vue"
import Index from "./components/Index.vue"
import { useUserStore } from "shared/store/user"
import { Icon } from "@iconify/vue"
import { MdPreview } from "md-editor-v3"
import "md-editor-v3/lib/preview.css"
import { consumeJSONEventStream } from "utils/stream"

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

const showClassDetailModal = ref(false)
const classDetailData = ref<ClassComparison | null>(null)
const classDetailLoading = ref(false)

const classDetailAiLoading = ref(false)
const classDetailAiContent = ref("")
const showClassDetailAiModal = ref(false)
let classDetailAiController: AbortController | null = null

async function loadClassDetail(className: string) {
  showClassDetailModal.value = true
  classDetailLoading.value = true
  classDetailData.value = null
  try {
    const res = await getClassPK([className])
    classDetailData.value = res.data.comparisons[0] ?? null
  } catch {
    // ignore
  } finally {
    classDetailLoading.value = false
  }
}

async function analyzeSingleClassWithAI() {
  if (!classDetailData.value) return
  if (classDetailAiController) classDetailAiController.abort()
  const controller = new AbortController()
  classDetailAiController = controller

  showClassDetailModal.value = false
  showClassDetailAiModal.value = true
  classDetailAiContent.value = ""
  classDetailAiLoading.value = true

  const headers: Record<string, string> = { "Content-Type": "application/json" }
  const csrfToken = getCSRFToken()
  if (csrfToken) headers["X-CSRFToken"] = csrfToken

  try {
    const response = await fetch("/api/ai/class_single", {
      method: "POST",
      headers,
      body: JSON.stringify({ comparison: classDetailData.value }),
      signal: controller.signal,
    })
    if (!response.ok) throw new Error("AI 分析生成失败")

    let hasStarted = false
    await consumeJSONEventStream(response, {
      signal: controller.signal,
      onEvent(event) {
        if (event === "end" && !hasStarted) classDetailAiLoading.value = false
      },
      onMessage(payload) {
        const parsed = payload as { type?: string; content?: string; message?: string }
        if (parsed.type === "delta" && parsed.content) {
          if (!hasStarted) {
            hasStarted = true
            classDetailAiLoading.value = false
          }
          classDetailAiContent.value += parsed.content
        } else if (parsed.type === "error") {
          throw new Error(parsed.message || "AI 服务异常")
        } else if (parsed.type === "done" && !hasStarted) {
          classDetailAiLoading.value = false
        }
      },
    })
  } catch (error: any) {
    if (controller.signal.aborted) return
    message.error(error?.message || "AI 分析失败，请稍后再试")
    classDetailAiLoading.value = false
  } finally {
    if (classDetailAiController === controller) classDetailAiController = null
  }
}

interface ClassRank {
  rank: number
  class_name: string
  user_count: number
  total_ac: number
  total_submission: number
  avg_ac: number
  ac_rate: number
}

interface ClassComparison {
  class_name: string
  user_count: number
  total_ac: number
  total_submission: number
  avg_ac: number
  median_ac: number
  q1_ac: number
  q3_ac: number
  iqr: number
  std_dev: number
  top_10_avg: number
  middle_80_avg: number
  bottom_10_avg: number
  excellent_rate: number
  pass_rate: number
  active_rate: number
  ac_rate: number
  composite_score: number
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
    width: 60,
    titleAlign: "center",
    align: "center",
  },
  {
    title: "班级",
    key: "class_name",
    render: (row) =>
      `${row.class_name.slice(0, 2)}计算机${row.class_name.slice(2)}班`,
    minWidth: 120,
    titleAlign: "center",
    align: "center",
  },
  {
    title: "人数",
    key: "user_count",
    width: 80,
    titleAlign: "center",
    align: "center",
  },
  {
    title: "总AC数",
    key: "total_ac",
    width: 90,
    titleAlign: "center",
    align: "center",
  },
  {
    title: "提交数",
    key: "total_submission",
    width: 90,
    titleAlign: "center",
    align: "center",
  },
  {
    title: "平均AC数",
    key: "avg_ac",
    width: 100,
    titleAlign: "center",
    align: "center",
  },
  {
    title: "正确率",
    key: "ac_rate",
    width: 90,
    titleAlign: "center",
    align: "center",
    render: (row) => `${row.ac_rate}%`,
  },
  {
    title: "详情",
    key: "action",
    width: 70,
    titleAlign: "center",
    align: "center",
    render: (row) =>
      h(
        NButton,
        {
          text: true,
          type: "info",
          onClick: () => loadClassDetail(row.class_name),
        },
        () => "查看",
      ),
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
          <template #header>
            <n-flex align="center">
              <span>班级排名</span>
              <n-button
                type="primary"
                secondary
                @click="router.push('/class')"
                v-if="userStore.isAdminRole"
              >
                班级PK
              </n-button>
            </n-flex>
          </template>
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

  <n-modal
    v-model:show="showClassDetailModal"
    preset="card"
    :title="
      classDetailData
        ? `${classDetailData.class_name.slice(0, 2)}计算机${classDetailData.class_name.slice(2)}班`
        : '班级详情'
    "
    :style="{ width: '700px', maxWidth: '95vw' }"
  >
    <n-spin :show="classDetailLoading" style="min-height: 200px">
      <n-flex v-if="classDetailData" vertical :size="12">
        <n-grid :cols="5" :x-gap="8" responsive="screen">
          <n-gi>
            <n-statistic
              label="总AC数"
              :value="classDetailData.total_ac"
              size="large"
              class="stat-total-ac"
            >
              <template #suffix>
                <Icon icon="streamline-emojis:raised-fist-1" width="20" />
              </template>
            </n-statistic>
          </n-gi>
          <n-gi>
            <n-statistic
              label="平均AC数"
              :value="classDetailData.avg_ac.toFixed(2)"
              size="large"
              class="stat-avg-ac"
            >
              <template #suffix>
                <Icon icon="streamline-emojis:chart" width="20" />
              </template>
            </n-statistic>
          </n-gi>
          <n-gi>
            <n-statistic
              label="中位数AC数"
              :value="classDetailData.median_ac.toFixed(2)"
              size="large"
              class="stat-median-ac"
            >
              <template #suffix>
                <Icon icon="streamline-emojis:target" width="20" />
              </template>
            </n-statistic>
          </n-gi>
          <n-gi>
            <n-statistic
              label="总提交数"
              :value="classDetailData.total_submission"
              size="large"
              class="stat-total-submission"
            >
              <template #suffix>
                <Icon icon="streamline-emojis:paper" width="20" />
              </template>
            </n-statistic>
          </n-gi>
          <n-gi>
            <n-statistic
              label="AC率"
              :value="classDetailData.ac_rate.toFixed(1) + '%'"
              size="large"
              class="stat-ac-rate"
            >
              <template #suffix>
                <Icon icon="streamline-emojis:check-mark" width="20" />
              </template>
            </n-statistic>
          </n-gi>
        </n-grid>

        <n-divider style="margin: 12px 0" />

        <n-descriptions
          bordered
          :column="2"
          size="small"
          label-placement="left"
        >
          <n-descriptions-item label="第一四分位数(Q1)">
            <span style="color: #9254de; font-weight: 500">{{
              classDetailData.q1_ac.toFixed(2)
            }}</span>
          </n-descriptions-item>
          <n-descriptions-item label="第三四分位数(Q3)">
            <span style="color: #f759ab; font-weight: 500">{{
              classDetailData.q3_ac.toFixed(2)
            }}</span>
          </n-descriptions-item>
          <n-descriptions-item label="四分位距(IQR)">
            <span style="color: #13c2c2; font-weight: 500">{{
              classDetailData.iqr.toFixed(2)
            }}</span>
          </n-descriptions-item>
          <n-descriptions-item label="标准差">
            <span style="color: #fa8c16; font-weight: 500">{{
              classDetailData.std_dev.toFixed(2)
            }}</span>
          </n-descriptions-item>
          <n-descriptions-item label="前10%均值">
            <span style="color: #cf1322; font-weight: 600">{{
              classDetailData.top_10_avg.toFixed(2)
            }}</span>
          </n-descriptions-item>
          <n-descriptions-item label="中间80%均值">
            <span style="color: #389e0d; font-weight: 600">{{
              classDetailData.middle_80_avg.toFixed(2)
            }}</span>
          </n-descriptions-item>
          <n-descriptions-item label="后10%均值">
            <span style="color: #096dd9; font-weight: 500">{{
              classDetailData.bottom_10_avg.toFixed(2)
            }}</span>
          </n-descriptions-item>
          <n-descriptions-item label="人数">
            <span style="color: #1890ff; font-weight: 600">{{
              classDetailData.user_count
            }}</span>
          </n-descriptions-item>
        </n-descriptions>

        <n-card size="small" title="比率统计" embedded style="margin-top: 12px">
          <n-space vertical :size="10">
            <n-progress
              type="line"
              :percentage="classDetailData.excellent_rate"
              :show-indicator="true"
              :border-radius="4"
            >
              <template #default
                >优秀率:
                {{ classDetailData.excellent_rate.toFixed(1) }}%</template
              >
            </n-progress>
            <n-progress
              type="line"
              :percentage="classDetailData.pass_rate"
              :show-indicator="true"
              :border-radius="4"
              status="success"
            >
              <template #default
                >及格率: {{ classDetailData.pass_rate.toFixed(1) }}%</template
              >
            </n-progress>
            <n-progress
              type="line"
              :percentage="classDetailData.active_rate"
              :show-indicator="true"
              :border-radius="4"
              status="info"
            >
              <template #default
                >参与度: {{ classDetailData.active_rate.toFixed(1) }}%</template
              >
            </n-progress>
          </n-space>
        </n-card>

        <n-flex justify="center" align="center" :size="12" style="margin-top: 12px">
          <n-tag type="success" size="large">
            综合分: {{ classDetailData.composite_score.toFixed(1) }}
          </n-tag>
          <n-button
            type="info"
            size="small"
            :loading="classDetailAiLoading"
            @click="analyzeSingleClassWithAI"
          >
            <template #icon>
              <Icon icon="mingcute:ai-line" />
            </template>
            AI分析
          </n-button>
        </n-flex>
      </n-flex>
      <n-empty
        v-else-if="!classDetailLoading"
        description="暂无数据"
        style="padding: 40px 0"
      />
    </n-spin>
  </n-modal>

  <n-modal
    v-model:show="showClassDetailAiModal"
    preset="card"
    title="AI 分析报告"
    :style="{ width: '800px', maxWidth: '95vw' }"
  >
    <n-spin :show="classDetailAiLoading" :delay="50">
      <div style="min-height: 200px">
        <MdPreview v-if="classDetailAiContent" :model-value="classDetailAiContent" />
        <n-flex
          v-else-if="!classDetailAiLoading"
          align="center"
          justify="center"
          style="min-height: 200px"
        >
          <n-empty description="暂无分析内容" />
        </n-flex>
      </div>
    </n-spin>
  </n-modal>
</template>

<style scoped>
.stat-total-ac :deep(.n-statistic-value),
.stat-total-ac :deep(.n-statistic-value__content),
.stat-total-ac :deep(.n-number-animation),
.stat-total-ac :deep(.n-statistic-value > *),
.stat-total-ac :deep(.n-statistic-value span) {
  color: #ff4d4f !important;
  font-weight: 600;
}

.stat-avg-ac :deep(.n-statistic-value),
.stat-avg-ac :deep(.n-statistic-value__content),
.stat-avg-ac :deep(.n-number-animation),
.stat-avg-ac :deep(.n-statistic-value > *),
.stat-avg-ac :deep(.n-statistic-value span) {
  color: #52c41a !important;
  font-weight: 600;
}

.stat-median-ac :deep(.n-statistic-value),
.stat-median-ac :deep(.n-statistic-value__content),
.stat-median-ac :deep(.n-number-animation),
.stat-median-ac :deep(.n-statistic-value > *),
.stat-median-ac :deep(.n-statistic-value span) {
  color: #fa8c16 !important;
  font-weight: 600;
}

.stat-total-submission :deep(.n-statistic-value),
.stat-total-submission :deep(.n-statistic-value__content),
.stat-total-submission :deep(.n-number-animation),
.stat-total-submission :deep(.n-statistic-value > *),
.stat-total-submission :deep(.n-statistic-value span) {
  color: #805ad5 !important;
  font-weight: 600;
}

.stat-ac-rate :deep(.n-statistic-value),
.stat-ac-rate :deep(.n-statistic-value__content),
.stat-ac-rate :deep(.n-number-animation),
.stat-ac-rate :deep(.n-statistic-value > *),
.stat-ac-rate :deep(.n-statistic-value span) {
  color: #00b894 !important;
  font-weight: 600;
}
</style>

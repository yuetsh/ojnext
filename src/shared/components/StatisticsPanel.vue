<template>
  <n-flex align="center">
    <n-input
      placeholder="用户（可选）"
      v-model:value="query.username"
      style="width: 150px"
      clearable
    />
    <n-input
      placeholder="题号（可选）"
      v-model:value="query.problem"
      style="width: 120px"
      clearable
    />
    <n-select
      style="width: 120px"
      v-model:value="query.duration"
      :options="options"
    />
    <n-button type="primary" @click="handleStatistics">统计</n-button>
    <n-button v-if="route.name !== 'submissions'" @click="goSubmissions">
      前往提交列表
    </n-button>
  </n-flex>

  <n-empty v-if="count.total === 0" description="暂无数据" style="margin: 40px 0" />

  <template v-if="count.total > 0">
    <n-divider style="margin: 16px 0" />
    <n-flex justify="space-around">
      <div class="stat-item">
        <div class="stat-label">总提交</div>
        <n-gradient-text type="info" font-size="28">{{ count.total }}</n-gradient-text>
      </div>
      <div class="stat-item">
        <div class="stat-label">正确提交</div>
        <n-gradient-text type="primary" font-size="28">{{ count.accepted }}</n-gradient-text>
      </div>
      <div class="stat-item">
        <div class="stat-label">正确率</div>
        <n-gradient-text type="warning" font-size="28">{{ count.rate }}</n-gradient-text>
      </div>
      <template v-if="person.count > 0">
        <div class="stat-item">
          <div class="stat-label">完成人数</div>
          <n-gradient-text type="error" font-size="28">{{ list.length }}</n-gradient-text>
        </div>
        <div class="stat-item">
          <div class="stat-label">班级人数</div>
          <n-gradient-text type="warning" font-size="28">{{ adjustedPersonCount }}</n-gradient-text>
        </div>
        <div class="stat-item">
          <div class="stat-label">完成度</div>
          <n-gradient-text type="success" font-size="28">{{ adjustedPersonRate }}</n-gradient-text>
        </div>
      </template>
    </n-flex>
    <n-divider style="margin: 16px 0" />

    <n-tabs animated type="line">
      <n-tab-pane name="charts" tab="数据图表">
        <n-grid :cols="2" :x-gap="20" :y-gap="20" style="margin-top: 12px">
          <n-gi>
            <n-card title="提交正确率">
              <Doughnut :data="pieChartData" :options="pieChartOptions" />
            </n-card>
          </n-gi>
          <n-gi v-if="person.count > 0">
            <n-card title="班级完成度">
              <Doughnut :data="completionChartData" :options="completionChartOptions" />
            </n-card>
          </n-gi>
        </n-grid>
      </n-tab-pane>

      <n-tab-pane name="submissions" tab="提交记录">
        <n-data-table
          v-if="list.length"
          striped
          :columns="columns"
          :data="list"
          :row-key="rowKey"
          :expanded-row-keys="expandedRowKeys"
          @update:expanded-row-keys="updateExpandedRowKeys"
          :row-props="rowProps"
          style="margin-top: 12px"
        />
      </n-tab-pane>

      <n-tab-pane name="unaccepted" :tab="`未完成（${visibleUnaccepted.length}）`">
        <n-flex align="center" style="margin: 12px 0">
          <n-switch v-model:value="hideMode" size="large">
            <template #checked>请假隐藏中</template>
            <template #unchecked>请假隐藏</template>
          </n-switch>
          <n-button v-if="hiddenCount > 0" size="small" type="info" @click="showAll">
            恢复 {{ hiddenCount }} 位
          </n-button>
        </n-flex>
        <n-flex size="large" align="center">
          <n-gradient-text v-if="visibleUnaccepted.length === 0" font-size="24" type="success">
            全都完成了
          </n-gradient-text>
          <template v-for="item in visibleUnaccepted" :key="item.username">
            <n-tag v-if="hideMode" closable size="large" style="font-size: 20px" @close="hideStudent(item.username)">
              {{ item.real_name }}
            </n-tag>
            <span v-else style="font-size: 24px">{{ item.real_name }}</span>
          </template>
        </n-flex>
      </n-tab-pane>
    </n-tabs>
  </template>
</template>
<script setup lang="ts">
import { h } from "vue"
import { formatISO, sub, type Duration } from "date-fns"
import { getSubmissionStatistics } from "oj/api"
import { DURATION_OPTIONS } from "utils/constants"
import { Doughnut } from "vue-chartjs"
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from "chart.js"
import { NButton, NFlex, NText, type DataTableRowKey } from "naive-ui"
import { JUDGE_STATUS } from "utils/constants"
import type { SUBMISSION_RESULT } from "utils/types"

// 注册 Chart.js 组件
ChartJS.register(ArcElement, Title, Tooltip, Legend)

interface Props {
  problem: string
  username: string
}

const props = defineProps<Props>()

const options: SelectOption[] = [
  { label: "10分钟内", value: "minutes:10" },
  { label: "20分钟内", value: "minutes:20" },
  { label: "30分钟内", value: "minutes:30" },
  ...DURATION_OPTIONS,
  { label: "全部时段", value: "all" },
]

function openSubmission(id: string) {
  window.open(`/submission/${id}`, "_blank", "noopener")
}

const columns: DataTableColumn<UserStatistic>[] = [
  {
    type: "expand",
    renderExpand: (row) => {
      return h(NFlex, { size: "small", wrap: true }, () =>
        row.submission_items.map((item) =>
          h(
            NButton,
            {
              size: "small",
              tertiary: true,
              type: JUDGE_STATUS[item.result]?.type ?? "default",
              style: "width: 120px",
              onClick: (event: MouseEvent) => {
                event.stopPropagation()
                openSubmission(item.id)
              },
            },
            () => item.id.toString().slice(0, 12),
          ),
        ),
      )
    },
  },
  { title: "用户", key: "username" },
  { title: "提交数", key: "submission_count" },
  { title: "已解决", key: "accepted_count" },
  { title: "正确率", key: "correct_rate" },
]

const query = reactive({
  username: props.username,
  problem: props.problem,
  duration: options[0].value,
})

const count = reactive({
  total: 0,
  accepted: 0,
  rate: 0,
})
const person = reactive({
  count: 0,
  rate: 0,
})
const route = useRoute()
const router = useRouter()

interface UserStatistic {
  username: string
  submission_count: number
  accepted_count: number
  correct_rate: string
  submission_items: Array<{
    id: string
    result: SUBMISSION_RESULT
  }>
}

interface UnacceptedItem {
  username: string
  real_name: string
}

const list = ref<UserStatistic[]>([])
const listUnaccepted = ref<UnacceptedItem[]>([])
const expandedRowKeys = ref<DataTableRowKey[]>([])

const HIDE_DURATION = 2 * 60 * 60 * 1000
const STORAGE_KEY = "oj_hidden_students"

function loadHidden(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}")
  } catch {
    return {}
  }
}

const hiddenStudents = ref<Record<string, number>>(loadHidden())
const hideMode = ref(false)

function saveHidden(data: Record<string, number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function hideStudent(username: string) {
  hiddenStudents.value = {
    ...hiddenStudents.value,
    [username]: Date.now() + HIDE_DURATION,
  }
  saveHidden(hiddenStudents.value)
}

function showAll() {
  hiddenStudents.value = {}
  saveHidden({})
}

const visibleUnaccepted = computed(() => {
  const now = Date.now()
  return listUnaccepted.value.filter((item) => {
    const exp = hiddenStudents.value[item.username]
    return !exp || exp <= now
  })
})

const hiddenCount = computed(() => {
  const now = Date.now()
  return listUnaccepted.value.filter((item) => {
    const exp = hiddenStudents.value[item.username]
    return !!exp && exp > now
  }).length
})

const adjustedPersonCount = computed(() => person.count - hiddenCount.value)

const adjustedPersonRate = computed(() => {
  if (adjustedPersonCount.value <= 0) return "0%"
  const rate = Math.min(100, (list.value.length / adjustedPersonCount.value) * 100)
  return `${Math.round(rate * 100) / 100}%`
})

onMounted(() => {
  const now = Date.now()
  const cleaned = Object.fromEntries(
    Object.entries(hiddenStudents.value).filter(([, exp]) => exp > now),
  )
  hiddenStudents.value = cleaned
  saveHidden(cleaned)
})

// 饼图数据 - 提交正确率分布
const pieChartData = computed(() => {
  const wrongCount = count.total - count.accepted
  return {
    labels: ["正确提交", "错误提交"],
    datasets: [
      {
        label: "提交数",
        data: [count.accepted, wrongCount],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 2,
      },
    ],
  }
})

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const label = context.label || ""
          const value = context.parsed || 0
          const total = context.dataset.data.reduce(
            (a: number, b: number) => a + b,
            0,
          )
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: ${value} (${percentage}%)`
        },
      },
    },
  },
}

// 环形图数据 - 班级完成度
const completionChartData = computed(() => {
  const completedCount = list.value.length
  const uncompletedCount = Math.max(0, adjustedPersonCount.value - completedCount)
  return {
    labels: ["已完成", "未完成"],
    datasets: [
      {
        label: "人数",
        data: [completedCount, uncompletedCount],
        backgroundColor: ["rgba(106, 176, 76, 0.6)", "rgba(255, 159, 64, 0.6)"],
        borderColor: ["rgba(106, 176, 76, 1)", "rgba(255, 159, 64, 1)"],
        borderWidth: 2,
      },
    ],
  }
})

const completionChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const label = context.label || ""
          const value = context.parsed || 0
          const total = context.dataset.data.reduce(
            (a: number, b: number) => a + b,
            0,
          )
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: ${value} (${percentage}%)`
        },
      },
    },
  },
}

const subOptions = computed<Duration>(() => {
  let dur = options.find((it) => it.value === query.duration) ?? options[0]
  const x = dur.value!.toString().split(":")
  const unit = x[0]
  const n = x[1]
  return { [unit]: parseInt(n) }
})

function goSubmissions() {
  router.push({
    name: "submissions",
    query: {
      username: query.username,
      problem: query.problem,
    },
  })
}
async function handleStatistics() {
  const current = Date.now()
  const end = formatISO(current)
  const duration =
    query.duration === "all"
      ? { end }
      : { start: formatISO(sub(current, subOptions.value)), end }
  const res = await getSubmissionStatistics(
    duration,
    query.problem,
    query.username,
  )
  count.total = res.data.submission_count
  count.accepted = res.data.accepted_count
  count.rate = res.data.correct_rate
  list.value = res.data.data
  listUnaccepted.value = res.data.data_unaccepted
  person.count = res.data.person_count
  person.rate = res.data.person_rate
}

function rowKey(row: UserStatistic): DataTableRowKey {
  return row.username
}

function updateExpandedRowKeys(keys: DataTableRowKey[]) {
  expandedRowKeys.value = keys.slice(-1)
}

function rowProps(row: UserStatistic) {
  return {
    style: "cursor: pointer;",
    onClick: () => {
      const key = rowKey(row)
      const isExpanded = expandedRowKeys.value.includes(key)
      expandedRowKeys.value = isExpanded ? [] : [key]
    },
  }
}
</script>
<style scoped>
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.stat-label {
  font-size: 13px;
  color: var(--n-text-color-3, #999);
}
</style>

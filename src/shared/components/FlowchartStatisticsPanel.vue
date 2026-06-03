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
      :options="durationOptions"
    />
    <n-button type="primary" @click="handleStatistics">统计</n-button>
  </n-flex>

  <n-empty
    v-if="data.total_count === 0"
    description="暂无数据"
    style="margin: 40px 0"
  />

  <template v-if="data.total_count > 0">
    <n-divider style="margin: 16px 0" />
    <n-flex justify="space-around">
      <div class="stat-item">
        <n-text>总提交</n-text>
        <n-gradient-text type="info" font-size="28">
          {{ data.total_count }}
        </n-gradient-text>
      </div>
      <div class="stat-item">
        <n-text>平均分</n-text>
        <n-gradient-text type="primary" font-size="28">
          {{ data.avg_score }}
        </n-gradient-text>
      </div>
      <template v-if="data.person_count > 0">
        <div class="stat-item">
          <n-text>完成人数</n-text>
          <n-gradient-text type="error" font-size="28">
            {{ data.completed_count }}
          </n-gradient-text>
        </div>
        <div class="stat-item">
          <n-text>班级人数</n-text>
          <n-gradient-text type="warning" font-size="28">
            {{ data.person_count }}
          </n-gradient-text>
        </div>
        <div class="stat-item">
          <n-text>完成度</n-text>
          <n-gradient-text type="success" font-size="28">
            {{ completionRate }}
          </n-gradient-text>
        </div>
      </template>
    </n-flex>
    <n-divider style="margin: 16px 0" />

    <n-tabs animated type="line">
      <n-tab-pane name="charts" tab="数据图表">
        <n-grid :cols="2" :x-gap="20" :y-gap="20" style="margin-top: 12px">
          <!-- 1. Grade pie chart -->
          <n-gi>
            <n-card title="等级分布">
              <Doughnut :data="gradeChartData" :options="doughnutOptions" />
            </n-card>
          </n-gi>
          <!-- 3. Completion doughnut -->
          <n-gi v-if="data.person_count > 0">
            <n-card title="班级完成度">
              <Doughnut
                :data="completionChartData"
                :options="doughnutOptions"
              />
            </n-card>
          </n-gi>
          <!-- 2. Radar chart -->
          <n-gi v-if="hasRadarData">
            <n-card title="四维评分雷达图">
              <Radar :data="radarChartData" :options="radarOptions" />
            </n-card>
          </n-gi>
          <!-- 4. Word cloud -->
          <n-gi :span="2" v-if="data.word_frequencies.length > 0">
            <n-card title="常见问题高频词">
              <div class="wordcloud-container">
                <canvas ref="wordcloudCanvas"></canvas>
              </div>
            </n-card>
          </n-gi>
        </n-grid>
      </n-tab-pane>

      <n-tab-pane
        v-if="data.data_unaccepted.length > 0"
        name="unaccepted"
        :tab="`未完成（${data.data_unaccepted.length}）`"
      >
        <n-flex size="large" align="center" style="margin-top: 12px">
          <span
            v-for="item in data.data_unaccepted"
            :key="item.username"
            style="font-size: 24px"
          >
            {{ item.real_name }}
          </span>
        </n-flex>
      </n-tab-pane>
    </n-tabs>
  </template>
</template>

<script setup lang="ts">
import { formatISO, sub, type Duration } from "date-fns"
import { getFlowchartStatistics } from "oj/api"
import { DURATION_OPTIONS } from "utils/constants"
import { Doughnut, Radar } from "vue-chartjs"
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  LinearScale,
} from "chart.js"
import {
  WordCloudController,
  WordElement,
} from "chartjs-chart-wordcloud"

ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  LinearScale,
  WordCloudController,
  WordElement,
)

interface Props {
  problem: string
  username: string
}

const props = defineProps<Props>()

const durationOptions: SelectOption[] = [
  { label: "10分钟内", value: "minutes:10" },
  { label: "20分钟内", value: "minutes:20" },
  { label: "30分钟内", value: "minutes:30" },
  ...DURATION_OPTIONS,
  { label: "全部时段", value: "all" },
]

const query = reactive({
  username: props.username,
  problem: props.problem,
  duration: durationOptions[0].value,
})

interface StatisticsData {
  total_count: number
  avg_score: number
  grade_distribution: Record<string, number>
  criteria_averages: Record<string, { avg: number; max: number }>
  person_count: number
  completed_count: number
  word_frequencies: { word: string; count: number }[]
  data_unaccepted: { username: string; real_name: string }[]
}

const data = reactive<StatisticsData>({
  total_count: 0,
  avg_score: 0,
  grade_distribution: {},
  criteria_averages: {},
  person_count: 0,
  completed_count: 0,
  word_frequencies: [],
  data_unaccepted: [],
})

const wordcloudCanvas = useTemplateRef<HTMLCanvasElement>("wordcloudCanvas")
let wordcloudChart: ChartJS | null = null

const completionRate = computed(() => {
  if (data.person_count <= 0) return "0%"
  const rate = Math.min(
    100,
    (data.completed_count / data.person_count) * 100,
  )
  return `${Math.round(rate * 100) / 100}%`
})

const GRADE_COLORS: Record<string, { bg: string; border: string }> = {
  S: { bg: "rgba(24, 160, 88, 0.6)", border: "rgba(24, 160, 88, 1)" },
  A: { bg: "rgba(32, 128, 240, 0.6)", border: "rgba(32, 128, 240, 1)" },
  B: { bg: "rgba(240, 160, 32, 0.6)", border: "rgba(240, 160, 32, 1)" },
  C: { bg: "rgba(208, 48, 80, 0.6)", border: "rgba(208, 48, 80, 1)" },
}

const gradeChartData = computed(() => {
  const grades = ["S", "A", "B", "C"]
  const counts = grades.map((g) => data.grade_distribution[g] || 0)
  const labels = grades.map(
    (g) => `${g}级 (${data.grade_distribution[g] || 0})`,
  )
  return {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: grades.map((g) => GRADE_COLORS[g].bg),
        borderColor: grades.map((g) => GRADE_COLORS[g].border),
        borderWidth: 2,
      },
    ],
  }
})

const completionChartData = computed(() => {
  const uncompleted = Math.max(0, data.person_count - data.completed_count)
  return {
    labels: ["已完成", "未完成"],
    datasets: [
      {
        data: [data.completed_count, uncompleted],
        backgroundColor: [
          "rgba(106, 176, 76, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
        borderColor: ["rgba(106, 176, 76, 1)", "rgba(255, 159, 64, 1)"],
        borderWidth: 2,
      },
    ],
  }
})

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: "bottom" as const },
    tooltip: {
      callbacks: {
        label(context: any) {
          const label = context.label || ""
          const value = context.parsed || 0
          const total = context.dataset.data.reduce(
            (a: number, b: number) => a + b,
            0,
          )
          const pct = ((value / total) * 100).toFixed(1)
          return `${label}: ${value} (${pct}%)`
        },
      },
    },
  },
}

const CRITERIA_ORDER = ["逻辑正确性", "完整性", "规范性", "清晰度"]

const hasRadarData = computed(() =>
  CRITERIA_ORDER.some((k) => k in data.criteria_averages),
)

const radarChartData = computed(() => {
  const labels = CRITERIA_ORDER
  const values = CRITERIA_ORDER.map((k) => {
    const item = data.criteria_averages[k]
    if (!item) return 0
    return Math.round((item.avg / item.max) * 100)
  })
  return {
    labels,
    datasets: [
      {
        label: "平均得分率 (%)",
        data: values,
        backgroundColor: "rgba(32, 128, 240, 0.2)",
        borderColor: "rgba(32, 128, 240, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(32, 128, 240, 1)",
      },
    ],
  }
})

const radarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    r: {
      beginAtZero: true,
      max: 100,
      ticks: { stepSize: 20 },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label(context: any) {
          const key = CRITERIA_ORDER[context.dataIndex]
          const item = data.criteria_averages[key]
          if (!item) return ""
          return `${key}: ${item.avg}/${item.max} (${context.parsed.r}%)`
        },
      },
    },
  },
}

const WORD_COLORS = [
  "#2080f0",
  "#18a058",
  "#f0a020",
  "#d03050",
  "#722ed1",
  "#13c2c2",
  "#1890ff",
  "#52c41a",
  "#faad14",
  "#f5222d",
]

function renderWordCloud() {
  if (!wordcloudCanvas.value || data.word_frequencies.length === 0) return

  if (wordcloudChart) {
    wordcloudChart.destroy()
    wordcloudChart = null
  }

  const words = data.word_frequencies
  const maxCount = Math.max(...words.map((w) => w.count))

  wordcloudChart = new ChartJS(wordcloudCanvas.value, {
    type: "wordCloud" as any,
    data: {
      labels: words.map((w) => w.word),
      datasets: [
        {
          label: "",
          data: words.map((w) => 10 + (w.count / maxCount) * 50),
          color: words.map(
            (_, i) => WORD_COLORS[i % WORD_COLORS.length],
          ),
          rotate: 0,
        } as any,
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(context: any) {
              const word = words[context.dataIndex]
              return word ? `${word.word}: ${word.count}次` : ""
            },
          },
        },
      },
    },
  })
}

const subOptions = computed<Duration>(() => {
  const dur =
    durationOptions.find((it) => it.value === query.duration) ??
    durationOptions[0]
  const x = dur.value!.toString().split(":")
  return { [x[0]]: parseInt(x[1]) }
})

async function handleStatistics() {
  const current = Date.now()
  const end = formatISO(current)
  const duration =
    query.duration === "all"
      ? { end }
      : { start: formatISO(sub(current, subOptions.value)), end }
  const res = await getFlowchartStatistics(
    duration,
    query.problem,
    query.username,
  )
  Object.assign(data, res.data)
  await nextTick()
  renderWordCloud()
}

onUnmounted(() => {
  if (wordcloudChart) {
    wordcloudChart.destroy()
  }
})
</script>

<style scoped>
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.wordcloud-container {
  height: 300px;
  position: relative;
}
</style>

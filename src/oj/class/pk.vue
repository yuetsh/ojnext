<script setup lang="ts">
import { h } from "vue"
import { formatISO, sub, type Duration } from "date-fns"
import { getClassPK } from "oj/api"
import { useConfigStore } from "shared/store/config"
import { Icon } from "@iconify/vue"
import { Bar, Radar } from "vue-chartjs"
import { useBreakpoints } from "shared/composables/breakpoints"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Colors,
  Filler,
} from "chart.js"

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Colors,
  Filler,
)

const configStore = useConfigStore()
const message = useMessage()
const { isDesktop } = useBreakpoints()

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
  bottom_10_avg: number
  top_25_avg: number
  bottom_25_avg: number
  excellent_rate: number
  pass_rate: number
  active_rate: number
  ac_rate: number
  recent_total_ac?: number
  recent_avg_ac?: number
  recent_median_ac?: number
  recent_top_10_avg?: number
  recent_active_count?: number
}

const selectedClasses = ref<string[]>([])
const comparisons = ref<ClassComparison[]>([])
const duration = ref<string>("")
const loading = ref(false)
const hasTimeRange = ref(false)

// 时间段选项（与 rank/list.vue 保持一致）
const timeRangeOptions: SelectOption[] = [
  { label: "全部时间", value: "" },
  { label: "一周内", value: "weeks:1" },
  { label: "一个月内", value: "months:1" },
  { label: "两个月内", value: "months:2" },
  { label: "半年内", value: "months:6" },
  { label: "一年内", value: "years:1" },
]

// 计算时间段（与 rank/list.vue 保持一致）
const subOptions = computed<Duration | null>(() => {
  if (!duration.value || duration.value === "") {
    return null
  }
  const dur = timeRangeOptions.find((it) => it.value === duration.value)
  if (!dur || !dur.value || dur.value === "") {
    return null
  }
  const x = dur.value.toString().split(":")
  const unit = x[0]
  const n = x[1]
  return { [unit]: parseInt(n) } as Duration
})

// 根据时间段选项计算开始和结束时间
function getTimeRange(): {
  startTime?: string
  endTime?: string
} {
  if (!duration.value || duration.value === "" || !subOptions.value) {
    return {}
  }

  const current = Date.now()
  const startTime = formatISO(sub(current, subOptions.value))
  const endTime = formatISO(current)

  return {
    startTime,
    endTime,
  }
}

const classOptions = computed(() => {
  return (
    configStore.config?.class_list.map((item) => ({
      label: `${item.slice(0, 2)}计算机${item.slice(2)}班`,
      value: item,
    })) ?? []
  )
})

async function compare() {
  if (selectedClasses.value.length < 2) {
    message.warning("请至少选择2个班级")
    return
  }

  loading.value = true
  try {
    const { startTime, endTime } = getTimeRange()

    const res = await getClassPK(selectedClasses.value, startTime, endTime)
    comparisons.value = res.data.comparisons
    hasTimeRange.value = res.data.has_time_range || false
  } catch (error) {
    message.error("获取数据失败")
  } finally {
    loading.value = false
  }
}

// 计算排名颜色
function getRankColor(index: number) {
  if (index === 0) return { type: "success" as const, text: "1" }
  if (index === 1) return { type: "info" as const, text: "2" }
  if (index === 2) return { type: "warning" as const, text: "3" }
  return { type: "default" as const, text: `${index + 1}` }
}

// 获取班级颜色
function getClassColor(index: number) {
  const colors = [
    { bg: "rgba(24, 160, 88, 0.2)", border: "rgba(24, 160, 88, 0.8)" }, // success
    { bg: "rgba(32, 128, 240, 0.2)", border: "rgba(32, 128, 240, 0.8)" }, // info
    { bg: "rgba(240, 160, 32, 0.2)", border: "rgba(240, 160, 32, 0.8)" }, // warning
    { bg: "rgba(208, 48, 80, 0.2)", border: "rgba(208, 48, 80, 0.8)" }, // error
    { bg: "rgba(128, 90, 213, 0.2)", border: "rgba(128, 90, 213, 0.8)" }, // purple
    { bg: "rgba(0, 184, 148, 0.2)", border: "rgba(0, 184, 148, 0.8)" }, // teal
    { bg: "rgba(63, 81, 181, 0.2)", border: "rgba(63, 81, 181, 0.8)" }, // indigo
    { bg: "rgba(0, 172, 193, 0.2)", border: "rgba(0, 172, 193, 0.8)" }, // cyan
    { bg: "rgba(124, 179, 66, 0.2)", border: "rgba(124, 179, 66, 0.8)" }, // lime
    { bg: "rgba(233, 30, 99, 0.2)", border: "rgba(233, 30, 99, 0.8)" }, // pink
  ]
  return colors[index % colors.length]
}

// 总AC数对比图 - 每个班级用不同颜色
const totalAcChartData = computed(() => {
  if (comparisons.value.length === 0) return null

  const labels = comparisons.value.map((c) => c.class_name)
  const datasets = [
    {
      label: "总AC数",
      data: comparisons.value.map((c) => c.total_ac),
      backgroundColor: comparisons.value.map((_, i) => getClassColor(i).bg),
      borderColor: comparisons.value.map((_, i) => getClassColor(i).border),
      borderWidth: 2,
    },
  ]

  return { labels, datasets }
})

// 平均AC数对比图
const avgAcChartData = computed(() => {
  if (comparisons.value.length === 0) return null

  const labels = comparisons.value.map((c) => c.class_name)
  const datasets = [
    {
      label: "平均AC数",
      data: comparisons.value.map((c) => c.avg_ac),
      backgroundColor: comparisons.value.map((_, i) => getClassColor(i).bg),
      borderColor: comparisons.value.map((_, i) => getClassColor(i).border),
      borderWidth: 2,
    },
  ]

  return { labels, datasets }
})

// 中位数AC数对比图
const medianAcChartData = computed(() => {
  if (comparisons.value.length === 0) return null

  const labels = comparisons.value.map((c) => c.class_name)
  const datasets = [
    {
      label: "中位数AC数",
      data: comparisons.value.map((c) => c.median_ac),
      backgroundColor: comparisons.value.map((_, i) => getClassColor(i).bg),
      borderColor: comparisons.value.map((_, i) => getClassColor(i).border),
      borderWidth: 2,
    },
  ]

  return { labels, datasets }
})

// 优秀率对比图
const excellentRateChartData = computed(() => {
  if (comparisons.value.length === 0) return null

  const labels = comparisons.value.map((c) => c.class_name)
  const datasets = [
    {
      label: "优秀率",
      data: comparisons.value.map((c) => c.excellent_rate),
      backgroundColor: comparisons.value.map((_, i) => getClassColor(i).bg),
      borderColor: comparisons.value.map((_, i) => getClassColor(i).border),
      borderWidth: 2,
    },
  ]

  return { labels, datasets }
})

// 及格率对比图
const passRateChartData = computed(() => {
  if (comparisons.value.length === 0) return null

  const labels = comparisons.value.map((c) => c.class_name)
  const datasets = [
    {
      label: "及格率",
      data: comparisons.value.map((c) => c.pass_rate),
      backgroundColor: comparisons.value.map((_, i) => getClassColor(i).bg),
      borderColor: comparisons.value.map((_, i) => getClassColor(i).border),
      borderWidth: 2,
    },
  ]

  return { labels, datasets }
})

// 参与度对比图
const activeRateChartData = computed(() => {
  if (comparisons.value.length === 0) return null

  const labels = comparisons.value.map((c) => c.class_name)
  const datasets = [
    {
      label: "参与度",
      data: comparisons.value.map((c) => c.active_rate),
      backgroundColor: comparisons.value.map((_, i) => getClassColor(i).bg),
      borderColor: comparisons.value.map((_, i) => getClassColor(i).border),
      borderWidth: 2,
    },
  ]

  return { labels, datasets }
})

// 前10名平均对比图
const top10AvgChartData = computed(() => {
  if (comparisons.value.length === 0) return null

  const labels = comparisons.value.map((c) => c.class_name)
  const datasets = [
    {
      label: "前10名平均",
      data: comparisons.value.map((c) => c.top_10_avg),
      backgroundColor: comparisons.value.map((_, i) => getClassColor(i).bg),
      borderColor: comparisons.value.map((_, i) => getClassColor(i).border),
      borderWidth: 2,
    },
  ]

  return { labels, datasets }
})

// 后10名平均对比图
const bottom10AvgChartData = computed(() => {
  if (comparisons.value.length === 0) return null

  const labels = comparisons.value.map((c) => c.class_name)
  const datasets = [
    {
      label: "后10名平均",
      data: comparisons.value.map((c) => c.bottom_10_avg),
      backgroundColor: comparisons.value.map((_, i) => getClassColor(i).bg),
      borderColor: comparisons.value.map((_, i) => getClassColor(i).border),
      borderWidth: 2,
    },
  ]

  return { labels, datasets }
})

// 前25%平均对比图
const top25AvgChartData = computed(() => {
  if (comparisons.value.length === 0) return null

  const labels = comparisons.value.map((c) => c.class_name)
  const datasets = [
    {
      label: "前25%平均",
      data: comparisons.value.map((c) => c.top_25_avg),
      backgroundColor: comparisons.value.map((_, i) => getClassColor(i).bg),
      borderColor: comparisons.value.map((_, i) => getClassColor(i).border),
      borderWidth: 2,
    },
  ]

  return { labels, datasets }
})

// 后25%平均对比图
const bottom25AvgChartData = computed(() => {
  if (comparisons.value.length === 0) return null

  const labels = comparisons.value.map((c) => c.class_name)
  const datasets = [
    {
      label: "后25%平均",
      data: comparisons.value.map((c) => c.bottom_25_avg),
      backgroundColor: comparisons.value.map((_, i) => getClassColor(i).bg),
      borderColor: comparisons.value.map((_, i) => getClassColor(i).border),
      borderWidth: 2,
    },
  ]

  return { labels, datasets }
})

// 雷达图数据 - 多维度综合对比
const radarChartData = computed(() => {
  if (comparisons.value.length === 0) return null

  // 归一化数据到0-100范围
  const normalize = (value: number, max: number, min: number) => {
    if (max === min) return 50
    return ((value - min) / (max - min)) * 100
  }

  const metrics = [
    "总AC数",
    "平均AC数",
    "中位数AC数",
    "优秀率",
    "及格率",
    "参与度",
  ]

  // 计算每个指标的最大最小值
  const maxValues = [
    Math.max(...comparisons.value.map((c) => c.total_ac)),
    Math.max(...comparisons.value.map((c) => c.avg_ac)),
    Math.max(...comparisons.value.map((c) => c.median_ac)),
    100, // 优秀率最大值
    100, // 及格率最大值
    100, // 参与度最大值
  ]

  const minValues = [
    Math.min(...comparisons.value.map((c) => c.total_ac)),
    Math.min(...comparisons.value.map((c) => c.avg_ac)),
    Math.min(...comparisons.value.map((c) => c.median_ac)),
    0,
    0,
    0,
  ]

  const datasets = comparisons.value.map((c, index) => {
    const color = getClassColor(index)
    const rawData = [
      c.total_ac,
      c.avg_ac,
      c.median_ac,
      c.excellent_rate,
      c.pass_rate,
      c.active_rate,
    ]
    return {
      label: c.class_name,
      data: [
        normalize(c.total_ac, maxValues[0], minValues[0]),
        normalize(c.avg_ac, maxValues[1], minValues[1]),
        normalize(c.median_ac, maxValues[2], minValues[2]),
        c.excellent_rate,
        c.pass_rate,
        c.active_rate,
      ],
      rawData,
      backgroundColor: color.bg,
      borderColor: color.border,
      borderWidth: 2,
      pointBackgroundColor: color.border,
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: color.border,
    }
  })

  return {
    labels: metrics,
    datasets,
  }
})

// 图表配置 - 优化对比效果
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
      display: true,
      labels: {
        boxWidth: 0,
        padding: 10,
      },
    },
    tooltip: {
      mode: "index" as const,
      intersect: false,
      callbacks: {
        label: function (context: any) {
          let label = context.dataset.label || ""
          if (label) {
            label += ": "
          }
          if (context.parsed.y !== null) {
            label += context.parsed.y.toFixed(2)
          }
          return label
        },
      },
    },
    datalabels: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        display: true,
        color: "rgba(0, 0, 0, 0.05)",
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
}

const radarChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const dataset = context.dataset as any
          const rawValue = dataset?.rawData?.[context.dataIndex]
          const metric = context.label || ""
          const isRate = context.dataIndex >= 3
          if (rawValue === undefined || rawValue === null) {
            return `${dataset.label || ""}: ${context.parsed.r?.toFixed(2) ?? ""}`
          }
          const formatted = Number.isFinite(rawValue)
            ? isRate
              ? rawValue.toFixed(1)
              : Number.isInteger(rawValue)
                ? rawValue.toString()
                : rawValue.toFixed(2)
            : String(rawValue)
          const suffix = isRate ? "%" : ""
          return `${dataset.label || ""} - ${metric}: ${formatted}${suffix}`
        },
      },
    },
  },
  scales: {
    r: {
      beginAtZero: true,
      max: 100,
      ticks: {
        stepSize: 20,
      },
    },
  },
}
</script>

<template>
  <n-card>
    <n-flex vertical :size="20">
      <n-h2 style="margin-bottom: 0">班级PK</n-h2>

      <n-flex :wrap="false" align="flex-start" :size="16">
        <n-form-item
          label="选择班级（至少2个）"
          style="width: 300px; margin-bottom: 0"
        >
          <n-select
            v-model:value="selectedClasses"
            :options="classOptions"
            multiple
            placeholder="选择要比较的班级"
          />
        </n-form-item>

        <n-form-item
          label="时间段（可选）"
          style="width: 200px; margin-bottom: 0"
        >
          <n-select
            v-model:value="duration"
            :options="timeRangeOptions"
            clearable
            placeholder="选择时间段"
            style="width: 100%"
          />
        </n-form-item>

        <n-button
          type="primary"
          @click="compare"
          :loading="loading"
          style="margin-top: 26px"
        >
          开始PK
        </n-button>
      </n-flex>

      <!-- 班级对比卡片 -->
      <n-grid v-if="comparisons.length > 0" :cols="2" :x-gap="16" :y-gap="16">
        <n-gi
          v-for="(classData, index) in comparisons"
          :key="classData.class_name"
          :span="isDesktop ? 1 : 2"
        >
          <n-card
            :title="`${classData.class_name.slice(0, 2)}计算机${classData.class_name.slice(2)}班`"
            :bordered="true"
            hoverable
            :style="{
              borderTop: `4px solid ${getClassColor(index).border}`,
            }"
          >
            <template #header-extra>
              <n-tag :type="getRankColor(index).type" size="large">
                #{{ getRankColor(index).text }}
              </n-tag>
            </template>

            <!-- 班级信息布局 -->
            <n-flex vertical :size="12">
              <!-- AC核心指标 -->
              <n-grid :cols="5" :x-gap="8" responsive="screen">
                <n-gi>
                  <n-statistic
                    label="总AC数"
                    :value="classData.total_ac"
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
                    :value="classData.avg_ac.toFixed(2)"
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
                    :value="classData.median_ac.toFixed(2)"
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
                    :value="classData.total_submission"
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
                    :value="classData.ac_rate.toFixed(1) + '%'"
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

              <!-- 详细统计 - 紧凑布局，统一格式 -->
              <n-descriptions
                bordered
                :column="2"
                size="small"
                label-placement="left"
              >
                <!-- 分位数统计 -->
                <n-descriptions-item label="第一四分位数(Q1)">
                  <span style="color: #9254de; font-weight: 500">{{
                    classData.q1_ac.toFixed(2)
                  }}</span>
                </n-descriptions-item>
                <n-descriptions-item label="第三四分位数(Q3)">
                  <span style="color: #f759ab; font-weight: 500">{{
                    classData.q3_ac.toFixed(2)
                  }}</span>
                </n-descriptions-item>
                <n-descriptions-item label="四分位距(IQR)">
                  <span style="color: #13c2c2; font-weight: 500">{{
                    classData.iqr.toFixed(2)
                  }}</span>
                </n-descriptions-item>
                <n-descriptions-item label="标准差">
                  <span style="color: #fa8c16; font-weight: 500">{{
                    classData.std_dev.toFixed(2)
                  }}</span>
                </n-descriptions-item>

                <!-- 分层统计 -->
                <n-descriptions-item label="前10名平均">
                  <span style="color: #cf1322; font-weight: 600">{{
                    classData.top_10_avg.toFixed(2)
                  }}</span>
                </n-descriptions-item>
                <n-descriptions-item label="后10名平均">
                  <span style="color: #096dd9; font-weight: 500">{{
                    classData.bottom_10_avg.toFixed(2)
                  }}</span>
                </n-descriptions-item>
                <n-descriptions-item label="前25%平均">
                  <span style="color: #f5222d; font-weight: 600">{{
                    classData.top_25_avg.toFixed(2)
                  }}</span>
                </n-descriptions-item>
                <n-descriptions-item label="后25%平均">
                  <span style="color: #531dab; font-weight: 500">{{
                    classData.bottom_25_avg.toFixed(2)
                  }}</span>
                </n-descriptions-item>

                <!-- 人数 -->
                <n-descriptions-item label="人数">
                  <span style="color: #1890ff; font-weight: 600">{{
                    classData.user_count
                  }}</span>
                </n-descriptions-item>
              </n-descriptions>

              <!-- 比率统计 - 使用进度条图表 -->
              <n-card
                size="small"
                title="比率统计"
                embedded
                style="margin-top: 12px"
              >
                <n-space vertical :size="10">
                  <n-progress
                    type="line"
                    :percentage="classData.excellent_rate"
                    :show-indicator="true"
                    :border-radius="4"
                  >
                    <template #default>
                      优秀率: {{ classData.excellent_rate.toFixed(1) }}%
                    </template>
                  </n-progress>
                  <n-progress
                    type="line"
                    :percentage="classData.pass_rate"
                    :show-indicator="true"
                    :border-radius="4"
                    status="success"
                  >
                    <template #default>
                      及格率: {{ classData.pass_rate.toFixed(1) }}%
                    </template>
                  </n-progress>
                  <n-progress
                    type="line"
                    :percentage="classData.active_rate"
                    :show-indicator="true"
                    :border-radius="4"
                    status="info"
                  >
                    <template #default>
                      参与度: {{ classData.active_rate.toFixed(1) }}%
                    </template>
                  </n-progress>
                </n-space>
              </n-card>

              <!-- 时间段统计（如果有） -->
              <template
                v-if="hasTimeRange && classData.recent_total_ac !== undefined"
              >
                <n-descriptions
                  bordered
                  :column="2"
                  size="small"
                  label-placement="left"
                  style="margin-top: 12px"
                >
                  <n-descriptions-item label="时间段总AC">
                    <span style="color: #ff7875; font-weight: 600">{{
                      classData.recent_total_ac
                    }}</span>
                  </n-descriptions-item>
                  <n-descriptions-item label="时间段平均AC">
                    <span style="color: #73d13d; font-weight: 600">{{
                      classData.recent_avg_ac?.toFixed(2)
                    }}</span>
                  </n-descriptions-item>
                  <n-descriptions-item label="时间段中位数AC">
                    <span style="color: #ffc53d; font-weight: 600">{{
                      classData.recent_median_ac?.toFixed(2)
                    }}</span>
                  </n-descriptions-item>
                  <n-descriptions-item label="时间段前10名平均">
                    <span style="color: #ff4d4f; font-weight: 600">{{
                      classData.recent_top_10_avg?.toFixed(2)
                    }}</span>
                  </n-descriptions-item>
                  <n-descriptions-item label="活跃学生数" :span="2">
                    <span style="color: #1890ff; font-weight: 600">{{
                      classData.recent_active_count
                    }}</span>
                  </n-descriptions-item>
                </n-descriptions>
              </template>
            </n-flex>
          </n-card>
        </n-gi>
      </n-grid>

      <!-- 可视化图表 - 专注于对比 -->
      <template v-if="comparisons.length > 0">
        <!-- AC核心指标对比 - 三个独立图表并排显示 -->
        <n-card title="AC核心指标对比" style="margin-top: 20px">
          <n-grid :cols="3" :x-gap="16" :y-gap="16">
            <n-gi>
              <div style="height: 300px">
                <Bar
                  v-if="totalAcChartData"
                  :data="totalAcChartData"
                  :options="chartOptions"
                />
              </div>
            </n-gi>
            <n-gi>
              <div style="height: 300px">
                <Bar
                  v-if="avgAcChartData"
                  :data="avgAcChartData"
                  :options="chartOptions"
                />
              </div>
            </n-gi>
            <n-gi>
              <div style="height: 300px">
                <Bar
                  v-if="medianAcChartData"
                  :data="medianAcChartData"
                  :options="chartOptions"
                />
              </div>
            </n-gi>
          </n-grid>
        </n-card>

        <!-- 比率统计对比 - 三个独立图表并排显示 -->
        <n-card title="比率统计对比" style="margin-top: 20px">
          <n-grid :cols="3" :x-gap="16" :y-gap="16">
            <n-gi>
              <div style="height: 300px">
                <Bar
                  v-if="excellentRateChartData"
                  :data="excellentRateChartData"
                  :options="chartOptions"
                />
              </div>
            </n-gi>
            <n-gi>
              <div style="height: 300px">
                <Bar
                  v-if="passRateChartData"
                  :data="passRateChartData"
                  :options="chartOptions"
                />
              </div>
            </n-gi>
            <n-gi>
              <div style="height: 300px">
                <Bar
                  v-if="activeRateChartData"
                  :data="activeRateChartData"
                  :options="chartOptions"
                />
              </div>
            </n-gi>
          </n-grid>
        </n-card>

        <!-- 分层统计对比 - 四个独立图表并排显示 -->
        <n-card title="分层统计对比" style="margin-top: 20px">
          <n-grid :cols="2" :x-gap="16" :y-gap="16">
            <n-gi>
              <div style="height: 300px">
                <Bar
                  v-if="top10AvgChartData"
                  :data="top10AvgChartData"
                  :options="chartOptions"
                />
              </div>
            </n-gi>
            <n-gi>
              <div style="height: 300px">
                <Bar
                  v-if="bottom10AvgChartData"
                  :data="bottom10AvgChartData"
                  :options="chartOptions"
                />
              </div>
            </n-gi>
            <n-gi>
              <div style="height: 300px">
                <Bar
                  v-if="top25AvgChartData"
                  :data="top25AvgChartData"
                  :options="chartOptions"
                />
              </div>
            </n-gi>
            <n-gi>
              <div style="height: 300px">
                <Bar
                  v-if="bottom25AvgChartData"
                  :data="bottom25AvgChartData"
                  :options="chartOptions"
                />
              </div>
            </n-gi>
          </n-grid>
        </n-card>

        <!-- 多维度雷达图 - 综合对比 -->
        <n-card title="多维度综合对比" style="margin-top: 20px">
          <div style="height: 500px">
            <Radar
              v-if="radarChartData"
              :data="radarChartData"
              :options="radarChartOptions"
            />
          </div>
        </n-card>
      </template>

      <!-- 对比表格 -->
      <n-card
        v-if="comparisons.length > 0"
        title="对比表格"
        style="margin-top: 20px"
      >
        <n-data-table
          :data="comparisons"
          :columns="[
            {
              title: '排名',
              key: 'rank',
              render: (_, index) => getRankColor(index).text,
              width: 80,
            },
            {
              title: '班级',
              key: 'class_name',
              render: (row) =>
                `${row.class_name.slice(0, 2)}计算机${row.class_name.slice(2)}班`,
              width: 160,
            },
            {
              title: '人数',
              key: 'user_count',
              width: 80,
              render: (row) =>
                h(
                  'span',
                  { style: { color: '#1890ff', fontWeight: '600' } },
                  row.user_count,
                ),
            },
            {
              title: '总AC数',
              key: 'total_ac',
              width: 100,
              render: (row) =>
                h(
                  'span',
                  { style: { color: '#ff4d4f', fontWeight: '600' } },
                  row.total_ac,
                ),
            },
            {
              title: '平均AC',
              key: 'avg_ac',
              width: 100,
              render: (row) =>
                h(
                  'span',
                  { style: { color: '#52c41a', fontWeight: '600' } },
                  row.avg_ac.toFixed(2),
                ),
            },
            {
              title: '中位数AC',
              key: 'median_ac',
              width: 100,
              render: (row) =>
                h(
                  'span',
                  { style: { color: '#fa8c16', fontWeight: '600' } },
                  row.median_ac.toFixed(2),
                ),
            },
            {
              title: '前10名平均',
              key: 'top_10_avg',
              width: 100,
              render: (row) =>
                h(
                  'span',
                  { style: { color: '#cf1322', fontWeight: '600' } },
                  row.top_10_avg.toFixed(2),
                ),
            },
            {
              title: '后10名平均',
              key: 'bottom_10_avg',
              width: 100,
              render: (row) =>
                h(
                  'span',
                  { style: { color: '#096dd9', fontWeight: '500' } },
                  row.bottom_10_avg.toFixed(2),
                ),
            },
            {
              title: '优秀率',
              key: 'excellent_rate',
              width: 100,
              render: (row) =>
                h(
                  'span',
                  { style: { color: '#faad14', fontWeight: '600' } },
                  row.excellent_rate.toFixed(1) + '%',
                ),
            },
            {
              title: '及格率',
              key: 'pass_rate',
              width: 100,
              render: (row) =>
                h(
                  'span',
                  { style: { color: '#52c41a', fontWeight: '600' } },
                  row.pass_rate.toFixed(1) + '%',
                ),
            },
            {
              title: '参与度',
              key: 'active_rate',
              width: 100,
              render: (row) =>
                h(
                  'span',
                  { style: { color: '#1890ff', fontWeight: '600' } },
                  row.active_rate.toFixed(1) + '%',
                ),
            },
          ]"
        />
      </n-card>
    </n-flex>
  </n-card>
</template>

<style scoped>
/* ==================== 统计数字颜色设置 ==================== */
/* 覆盖 Naive UI n-statistic 组件的所有可能类名 */

/* 总AC数 - 红色 */
.stat-total-ac :deep(.n-statistic-value),
.stat-total-ac :deep(.n-statistic-value__content),
.stat-total-ac :deep(.n-number-animation),
.stat-total-ac :deep(.n-statistic-value > *),
.stat-total-ac :deep(.n-statistic-value span) {
  color: #ff4d4f !important;
  font-weight: 600;
}

/* 平均AC数 - 绿色 */
.stat-avg-ac :deep(.n-statistic-value),
.stat-avg-ac :deep(.n-statistic-value__content),
.stat-avg-ac :deep(.n-number-animation),
.stat-avg-ac :deep(.n-statistic-value > *),
.stat-avg-ac :deep(.n-statistic-value span) {
  color: #52c41a !important;
  font-weight: 600;
}

/* 中位数AC数 - 橙色 */
.stat-median-ac :deep(.n-statistic-value),
.stat-median-ac :deep(.n-statistic-value__content),
.stat-median-ac :deep(.n-number-animation),
.stat-median-ac :deep(.n-statistic-value > *),
.stat-median-ac :deep(.n-statistic-value span) {
  color: #fa8c16 !important;
  font-weight: 600;
}

/* 总提交数 - 紫色 */
.stat-total-submission :deep(.n-statistic-value),
.stat-total-submission :deep(.n-statistic-value__content),
.stat-total-submission :deep(.n-number-animation),
.stat-total-submission :deep(.n-statistic-value > *),
.stat-total-submission :deep(.n-statistic-value span) {
  color: #805ad5 !important;
  font-weight: 600;
}

/* AC率 - 青色 */
.stat-ac-rate :deep(.n-statistic-value),
.stat-ac-rate :deep(.n-statistic-value__content),
.stat-ac-rate :deep(.n-number-animation),
.stat-ac-rate :deep(.n-statistic-value > *),
.stat-ac-rate :deep(.n-statistic-value span) {
  color: #00b894 !important;
  font-weight: 600;
}
</style>

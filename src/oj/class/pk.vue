<script setup lang="ts">
import { formatISO, sub, type Duration } from "date-fns"
import { getClassPK } from "oj/api"
import { useConfigStore } from "shared/store/config"
import { Icon } from "@iconify/vue"

const configStore = useConfigStore()
const message = useMessage()

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
const showDetails = ref<Record<string, boolean>>({})
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

    // 初始化展开状态
    comparisons.value.forEach((c) => {
      showDetails.value[c.class_name] = false
    })
  } catch (error) {
    message.error("获取数据失败")
  } finally {
    loading.value = false
  }
}

function toggleDetails(class_name: string) {
  showDetails.value[class_name] = !showDetails.value[class_name]
}

// 计算排名颜色
function getRankColor(index: number) {
  if (index === 0) return { type: "success" as const, text: "🥇" }
  if (index === 1) return { type: "info" as const, text: "🥈" }
  if (index === 2) return { type: "warning" as const, text: "🥉" }
  return { type: "default" as const, text: `${index + 1}` }
}
</script>

<template>
  <n-card>
    <n-flex vertical :size="20">
      <n-h2>班级PK</n-h2>

      <n-flex :wrap="false" align="center" :size="16">
        <n-form-item label="选择班级（至少2个）" style="width: 300px; margin-bottom: 0">
          <n-select
            v-model:value="selectedClasses"
            :options="classOptions"
            multiple
            placeholder="选择要比较的班级"
          />
        </n-form-item>

        <n-form-item label="时间段（可选）" style="width: 200px; margin-bottom: 0">
          <n-select
            v-model:value="duration"
            :options="timeRangeOptions"
            clearable
            placeholder="选择时间段"
            style="width: 100%"
          />
        </n-form-item>

        <n-button type="primary" @click="compare" :loading="loading">
          开始PK
        </n-button>
      </n-flex>

      <!-- 班级对比卡片 -->
      <n-grid
        v-if="comparisons.length > 0"
        :cols="comparisons.length > 2 ? 2 : comparisons.length"
        :x-gap="16"
        :y-gap="16"
      >
        <n-gi v-for="(classData, index) in comparisons" :key="classData.class_name">
          <n-card
            :title="classData.class_name"
            :bordered="true"
            hoverable
            :style="{
              borderTop: `4px solid ${
                getRankColor(index).type === 'success'
                  ? '#18a058'
                  : getRankColor(index).type === 'info'
                    ? '#2080f0'
                    : getRankColor(index).type === 'warning'
                      ? '#f0a020'
                      : '#d03050'
              }`,
            }"
          >
            <template #header-extra>
              <n-tag :type="getRankColor(index).type" size="large">
                {{ getRankColor(index).text }}
              </n-tag>
            </template>

            <!-- 基础统计 -->
            <n-flex vertical :size="12">
              <n-statistic label="总AC数" :value="classData.total_ac">
                <template #suffix>
                  <Icon icon="streamline-emojis:raised-fist-1" width="20" />
                </template>
              </n-statistic>

              <n-statistic label="平均AC数" :value="classData.avg_ac.toFixed(2)">
                <template #suffix>
                  <Icon icon="streamline-emojis:chart" width="20" />
                </template>
              </n-statistic>

              <n-statistic
                label="中位数AC数"
                :value="classData.median_ac.toFixed(2)"
              >
                <template #suffix>
                  <Icon icon="streamline-emojis:target" width="20" />
                </template>
              </n-statistic>

              <!-- 展开详细统计 -->
              <n-button
                text
                @click="toggleDetails(classData.class_name)"
                style="margin-top: 8px"
              >
                {{ showDetails[classData.class_name] ? "收起" : "展开" }}详细统计
                <Icon
                  :icon="
                    showDetails[classData.class_name]
                      ? 'mdi:chevron-up'
                      : 'mdi:chevron-down'
                  "
                  width="16"
                />
              </n-button>

              <!-- 详细统计面板 -->
              <n-collapse-transition :show="showDetails[classData.class_name]">
                <n-divider />

                <!-- 分位数统计 -->
                <n-descriptions bordered :column="2" size="small">
                  <n-descriptions-item label="第一四分位数(Q1)">
                    {{ classData.q1_ac.toFixed(2) }}
                  </n-descriptions-item>
                  <n-descriptions-item label="第三四分位数(Q3)">
                    {{ classData.q3_ac.toFixed(2) }}
                  </n-descriptions-item>
                  <n-descriptions-item label="四分位距(IQR)">
                    {{ classData.iqr.toFixed(2) }}
                  </n-descriptions-item>
                  <n-descriptions-item label="标准差">
                    {{ classData.std_dev.toFixed(2) }}
                  </n-descriptions-item>
                </n-descriptions>

                <n-divider />

                <!-- 分层统计 -->
                <n-h4 style="margin: 12px 0 8px 0">分层统计</n-h4>
                <n-descriptions bordered :column="2" size="small">
                  <n-descriptions-item label="前10名平均">
                    {{ classData.top_10_avg.toFixed(2) }}
                  </n-descriptions-item>
                  <n-descriptions-item label="后10名平均">
                    {{ classData.bottom_10_avg.toFixed(2) }}
                  </n-descriptions-item>
                  <n-descriptions-item label="前25%平均">
                    {{ classData.top_25_avg.toFixed(2) }}
                  </n-descriptions-item>
                  <n-descriptions-item label="后25%平均">
                    {{ classData.bottom_25_avg.toFixed(2) }}
                  </n-descriptions-item>
                </n-descriptions>

                <n-divider />

                <!-- 比率统计 -->
                <n-h4 style="margin: 12px 0 8px 0">比率统计</n-h4>
                <n-space vertical :size="8">
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

                <!-- 时间段统计（如果有） -->
                <template
                  v-if="hasTimeRange && classData.recent_total_ac !== undefined"
                >
                  <n-divider />
                  <n-h4 style="margin: 12px 0 8px 0">时间段内表现</n-h4>
                  <n-descriptions bordered :column="2" size="small">
                    <n-descriptions-item label="时间段总AC">
                      {{ classData.recent_total_ac }}
                    </n-descriptions-item>
                    <n-descriptions-item label="时间段平均AC">
                      {{ classData.recent_avg_ac?.toFixed(2) }}
                    </n-descriptions-item>
                    <n-descriptions-item label="时间段中位数AC">
                      {{ classData.recent_median_ac?.toFixed(2) }}
                    </n-descriptions-item>
                    <n-descriptions-item label="时间段前10名平均">
                      {{ classData.recent_top_10_avg?.toFixed(2) }}
                    </n-descriptions-item>
                    <n-descriptions-item label="活跃学生数">
                      {{ classData.recent_active_count }}
                    </n-descriptions-item>
                  </n-descriptions>
                </template>
              </n-collapse-transition>
            </n-flex>
          </n-card>
        </n-gi>
      </n-grid>

      <!-- 对比表格 -->
      <n-card v-if="comparisons.length > 0" title="对比表格" style="margin-top: 20px">
        <n-data-table
          :data="comparisons"
          :columns="[
            {
              title: '排名',
              key: 'rank',
              render: (_, index) => getRankColor(index).text,
              width: 80,
            },
            { title: '班级', key: 'class_name', width: 150 },
            { title: '人数', key: 'user_count', width: 80 },
            { title: '总AC数', key: 'total_ac', width: 100 },
            {
              title: '平均AC',
              key: 'avg_ac',
              render: (row) => row.avg_ac.toFixed(2),
            },
            {
              title: '中位数AC',
              key: 'median_ac',
              render: (row) => row.median_ac.toFixed(2),
            },
            {
              title: '前10名平均',
              key: 'top_10_avg',
              render: (row) => row.top_10_avg.toFixed(2),
            },
            {
              title: '后10名平均',
              key: 'bottom_10_avg',
              render: (row) => row.bottom_10_avg.toFixed(2),
            },
            {
              title: '优秀率',
              key: 'excellent_rate',
              render: (row) => row.excellent_rate.toFixed(1) + '%',
            },
            {
              title: '及格率',
              key: 'pass_rate',
              render: (row) => row.pass_rate.toFixed(1) + '%',
            },
            {
              title: '参与度',
              key: 'active_rate',
              render: (row) => row.active_rate.toFixed(1) + '%',
            },
          ]"
        />
      </n-card>
    </n-flex>
  </n-card>
</template>

<style scoped>
.n-statistic {
  margin-bottom: 8px;
}
</style>


<template>
  <n-card title="连续做题统计" size="small">
    <template #header-extra>
      <n-text depth="3" style="font-size: 12px">激励持续学习</n-text>
    </template>
    <n-spin :show="aiStore.loading.heatmap" :delay="50">
      <n-grid :cols="2" :x-gap="12" :y-gap="12">
        <n-gi>
          <n-statistic label="当前连续" :value="currentStreak">
            <template #suffix>
              <span style="font-size: 14px">天</span>
              <span
                v-if="currentStreak > 0"
                style="font-size: 20px; margin-left: 4px"
              >
                🔥
              </span>
            </template>
          </n-statistic>
        </n-gi>
        <n-gi>
          <n-statistic label="最长连续" :value="maxStreak">
            <template #suffix>
              <span style="font-size: 14px">天</span>
              <span
                v-if="maxStreak >= 7"
                style="font-size: 20px; margin-left: 4px"
              >
                ⭐
              </span>
            </template>
          </n-statistic>
        </n-gi>
        <n-gi>
          <n-statistic label="本周做题" :value="weekCount">
            <template #suffix>
              <span style="font-size: 14px">天</span>
            </template>
          </n-statistic>
        </n-gi>
        <n-gi>
          <n-statistic label="本月做题" :value="monthCount">
            <template #suffix>
              <span style="font-size: 14px">天</span>
            </template>
          </n-statistic>
        </n-gi>
      </n-grid>
      <n-divider style="margin: 12px 0" />
      <n-flex vertical size="small">
        <n-text depth="2" style="font-size: 12px">
          <span v-if="currentStreak === 0"> 开始做题，建立学习连续记录！ </span>
          <span v-else-if="currentStreak < 3"> 继续保持，争取连续3天！ </span>
          <span v-else-if="currentStreak < 7">
            很棒！继续保持一周连续记录！
          </span>
          <span v-else-if="currentStreak < 30">
            太棒了！坚持满30天将获得「持之以恒」成就！
          </span>
          <span v-else>
            🎉 恭喜你！你已经连续学习 {{ currentStreak }} 天，真的非常厉害！
          </span>
        </n-text>
      </n-flex>
    </n-spin>
  </n-card>
</template>

<script setup lang="ts">
import { useAIStore } from "oj/store/ai"

const aiStore = useAIStore()

// 计算连续天数
const streakData = computed(() => {
  const heatmap = aiStore.heatmapData
  if (!heatmap || heatmap.length === 0) {
    return {
      currentStreak: 0,
      maxStreak: 0,
      weekCount: 0,
      monthCount: 0,
    }
  }

  // 按时间戳排序
  const sortedData = [...heatmap].sort((a, b) => a.timestamp - b.timestamp)

  let currentStreak = 0
  let maxStreak = 0
  let tempStreak = 0
  let lastDate: Date | null = null

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  let weekCount = 0
  let monthCount = 0

  // 检查今天是否有做题
  const todayData = sortedData.find((item) => {
    const itemDate = new Date(item.timestamp)
    return (
      itemDate.getFullYear() === today.getFullYear() &&
      itemDate.getMonth() === today.getMonth() &&
      itemDate.getDate() === today.getDate()
    )
  })
  const hasToday = todayData && todayData.value > 0

  // 遍历数据计算连续天数
  for (const item of sortedData) {
    if (item.value > 0) {
      const currentDate = new Date(item.timestamp)

      // 统计本周和本月
      if (currentDate >= weekAgo) {
        weekCount++
      }
      if (currentDate >= monthAgo) {
        monthCount++
      }

      if (lastDate === null) {
        tempStreak = 1
      } else {
        const dayDiff = Math.floor(
          (currentDate.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000),
        )
        if (dayDiff === 1) {
          tempStreak++
        } else {
          maxStreak = Math.max(maxStreak, tempStreak)
          tempStreak = 1
        }
      }

      lastDate = currentDate
    }
  }

  maxStreak = Math.max(maxStreak, tempStreak)

  // 计算当前连续天数（必须包含今天或昨天）
  if (lastDate) {
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const lastDateOnly = new Date(
      lastDate.getFullYear(),
      lastDate.getMonth(),
      lastDate.getDate(),
    )

    if (
      lastDateOnly.getTime() === today.getTime() ||
      lastDateOnly.getTime() === yesterday.getTime()
    ) {
      currentStreak = tempStreak
    } else {
      currentStreak = 0
    }
  }

  return {
    currentStreak,
    maxStreak,
    weekCount,
    monthCount,
  }
})

const currentStreak = computed(() => streakData.value.currentStreak)
const maxStreak = computed(() => streakData.value.maxStreak)
const weekCount = computed(() => streakData.value.weekCount)
const monthCount = computed(() => streakData.value.monthCount)
</script>

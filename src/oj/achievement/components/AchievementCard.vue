<script setup lang="ts">
import AchievementIcon from "shared/components/AchievementIcon.vue"
import type { Achievement } from "utils/types"

const props = defineProps<{ achievement: Achievement }>()

const RARITY_COLOR: Record<string, string> = {
  bronze: "#b87333",
  silver: "#9fa6b2",
  gold: "#e0a300",
  platinum: "#7dd3fc",
}

const RARITY_LABEL: Record<string, string> = {
  bronze: "青铜",
  silver: "白银",
  gold: "黄金",
  platinum: "白金",
}

// 隐藏且未解锁：后端已把名称/描述/图标和条件三件套都遮成 ??? 和 null，
// 这里只负责不要把 null 渲染出来，也不要画出会泄露门槛的进度条
const masked = computed(
  () => props.achievement.hidden && !props.achievement.unlocked,
)

// 获得率低于 5% 的加稀有闪光边框
const isRare = computed(
  () => props.achievement.unlock_rate > 0 && props.achievement.unlock_rate < 5,
)

// 只有"越多越好"的成就画进度条。lte 类（如最短 AC 代码 ≤ 50 字符）
// 画成百分比毫无意义，改成直接显示当前最好成绩
const showProgressBar = computed(
  () =>
    !masked.value &&
    !props.achievement.unlocked &&
    props.achievement.operator === "gte" &&
    props.achievement.threshold !== null,
)

const showBestSoFar = computed(
  () =>
    !masked.value &&
    !props.achievement.unlocked &&
    props.achievement.operator === "lte" &&
    props.achievement.threshold !== null,
)

const percent = computed(() => {
  const { progress, threshold } = props.achievement
  if (threshold === null || threshold <= 0) return 100
  return Math.min(100, Math.round(((progress ?? 0) / threshold) * 100))
})

const unlockDate = computed(() => {
  const { unlock_time, backfilled } = props.achievement
  // 补发的记录不显示具体日期：一次补发会给几百人盖上同一个时间戳
  if (backfilled || !unlock_time) return "已获得"
  return `${new Date(unlock_time).toLocaleDateString()} 获得`
})
</script>

<template>
  <n-card
    size="small"
    :class="{ locked: !achievement.unlocked, rare: isRare }"
    :style="{ borderColor: RARITY_COLOR[achievement.rarity] }"
  >
    <div class="row">
      <div class="icon">
        <AchievementIcon :icon="achievement.icon" :size="32" />
      </div>
      <div class="body">
        <div class="title">
          <span class="name">{{ achievement.name }}</span>
          <n-tag
            size="tiny"
            :color="{
              borderColor: RARITY_COLOR[achievement.rarity],
              textColor: RARITY_COLOR[achievement.rarity],
            }"
          >
            {{ RARITY_LABEL[achievement.rarity] }}
          </n-tag>
        </div>
        <div class="desc">{{ achievement.description }}</div>

        <div v-if="achievement.unlocked" class="meta">
          <span>{{ unlockDate }}</span>
          <span class="rate">仅 {{ achievement.unlock_rate }}% 的人获得</span>
        </div>

        <div v-else-if="showProgressBar" class="meta">
          <n-progress
            type="line"
            :percentage="percent"
            :height="6"
            :show-indicator="false"
          />
          <span class="progress-text">
            {{ achievement.progress ?? 0 }} / {{ achievement.threshold }}
          </span>
        </div>

        <div v-else-if="showBestSoFar" class="meta">
          <span class="progress-text">
            目标 ≤ {{ achievement.threshold }}
          </span>
          <span v-if="achievement.progress !== null" class="rate">
            当前最好 {{ achievement.progress }}
          </span>
        </div>

        <div v-else class="meta">
          <span class="rate">仅 {{ achievement.unlock_rate }}% 的人获得</span>
        </div>
      </div>
    </div>
  </n-card>
</template>

<style scoped>
.row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.icon {
  font-size: 32px;
  line-height: 1;
}
.body {
  flex: 1;
  min-width: 0;
}
.title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}
.desc {
  margin-top: 4px;
  font-size: 13px;
  opacity: 0.75;
}
.meta {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  opacity: 0.65;
}
.meta :deep(.n-progress) {
  flex: 1;
}
.progress-text {
  white-space: nowrap;
}
.locked {
  filter: grayscale(1);
  opacity: 0.55;
}
.rare {
  box-shadow: 0 0 12px rgba(125, 211, 252, 0.55);
}
</style>

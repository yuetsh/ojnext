<script setup lang="ts">
import AchievementIcon from "shared/components/AchievementIcon.vue"
import { useRarityColor } from "shared/composables/rarity"
import { RARITY_COLOR, RARITY_LABEL } from "utils/constants"
import type { Achievement } from "utils/types"

const props = defineProps<{ achievement: Achievement }>()

// 边框用原色，tag 里的文字用跟主题走的那套
const rarityTextColor = useRarityColor()

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
    <n-thing>
      <template #avatar>
        <AchievementIcon :icon="achievement.icon" :size="32" />
      </template>

      <template #header>
        <n-flex align="center" :size="8">
          <n-text strong>{{ achievement.name }}</n-text>
          <n-tag
            size="tiny"
            :color="{
              borderColor: RARITY_COLOR[achievement.rarity],
              textColor: rarityTextColor[achievement.rarity],
            }"
          >
            {{ RARITY_LABEL[achievement.rarity] }}
          </n-tag>
        </n-flex>
      </template>

      <template #description>
        <n-text depth="3">{{ achievement.description }}</n-text>
      </template>

      <n-flex align="center" :size="8" :wrap="false">
        <template v-if="achievement.unlocked">
          <n-text depth="3" class="nowrap">{{ unlockDate }}</n-text>
          <n-text depth="3" class="nowrap">
            仅 {{ achievement.unlock_rate }}% 的人获得
          </n-text>
        </template>

        <template v-else-if="showProgressBar">
          <n-progress
            style="flex: 1"
            type="line"
            :percentage="percent"
            :height="6"
            :show-indicator="false"
          />
          <n-text depth="3" class="nowrap">
            {{ achievement.progress ?? 0 }} / {{ achievement.threshold }}
          </n-text>
        </template>

        <template v-else-if="showBestSoFar">
          <n-text depth="3" class="nowrap">
            目标 ≤ {{ achievement.threshold }}
          </n-text>
          <n-text v-if="achievement.progress !== null" depth="3" class="nowrap">
            当前最好 {{ achievement.progress }}
          </n-text>
        </template>

        <n-text v-else depth="3" class="nowrap">
          仅 {{ achievement.unlock_rate }}% 的人获得
        </n-text>
      </n-flex>
    </n-thing>
  </n-card>
</template>

<style scoped>
.nowrap {
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

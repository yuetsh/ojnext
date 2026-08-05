<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { getAchievements, getAchievementSummary } from "oj/achievement/api"
import { getUserBadges } from "oj/api"
import { useBreakpoints } from "shared/composables/breakpoints"
import { useRarityColor } from "shared/composables/rarity"
import type {
  Achievement,
  AchievementRarity,
  AchievementSummary,
} from "utils/types"
import AchievementCard from "./components/AchievementCard.vue"

interface UserBadge {
  id: number
  earned_time: string
  badge: {
    id: number
    name: string
    description: string
    icon: string
  }
}

const route = useRoute()
const name = computed(() => (route.query.name as string) || undefined)

// 断点走全站那套（tailwind md = 768px），不另开一套
const { isMobile } = useBreakpoints()

const achievements = ref<Achievement[]>([])
const summary = ref<AchievementSummary | null>(null)
const badges = ref<UserBadge[]>([])
const tab = ref("all")
const loading = ref(true)

// 奖杯和数字同色，一列读作一个单位
const rarityColor = useRarityColor()

// 白金在最左，青铜在最右——奖杯陈列按稀有度倒序，接口给的顺序反过来
const RARITY_RANK: Record<AchievementRarity, number> = {
  platinum: 0,
  gold: 1,
  silver: 2,
  bronze: 3,
}

const trophies = computed(() =>
  [...(summary.value?.rarity ?? [])].sort(
    (a, b) => RARITY_RANK[a.rarity] - RARITY_RANK[b.rarity],
  ),
)

// 进度条按稀有度分段，每段宽度是该档已获得占总数的比例，
// 拼起来正好是总完成度：条形的长度和构成都是真的
function segmentWidth(unlocked: number) {
  const total = summary.value?.total ?? 0
  return total ? `${(unlocked / total) * 100}%` : "0%"
}

const remaining = computed(() => {
  if (!summary.value) return 0
  return summary.value.total - summary.value.unlocked
})

const filtered = computed(() => {
  if (tab.value === "unlocked")
    return achievements.value.filter((a) => a.unlocked)
  if (tab.value === "locked")
    return achievements.value.filter((a) => !a.unlocked)
  return achievements.value
})

async function load() {
  loading.value = true
  try {
    const [list, sum, badgeRes] = await Promise.all([
      getAchievements(name.value),
      getAchievementSummary(name.value),
      getUserBadges(name.value),
    ])
    // http 客户端返回 ApiResponse<T>，真实载荷在 .data 里
    achievements.value = list.data.achievements
    summary.value = sum.data
    badges.value = (badgeRes.data ?? []) as UserBadge[]
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(name, load)
</script>

<template>
  <div class="hall" :class="{ mobile: isMobile }">
    <n-spin :show="loading">
      <n-card v-if="summary" class="overview">
        <div class="overview-row">
          <div class="level">
            <div class="plate">
              <span class="plate-num">{{ summary.percent }}</span>
              <span class="plate-unit">%</span>
            </div>
            <div class="plate-label">完成度</div>
          </div>

          <div class="trophies">
            <div
              v-for="r in trophies"
              :key="r.rarity"
              class="trophy"
              :class="{ none: !r.unlocked }"
            >
              <Icon
                icon="mdi:trophy"
                :width="30"
                :height="30"
                :style="{ color: rarityColor[r.rarity] }"
              />
              <div class="trophy-count">
                <b :style="{ color: rarityColor[r.rarity] }">{{
                  r.unlocked
                }}</b>
                <span>/ {{ r.total }}</span>
              </div>
              <div class="trophy-label">{{ r.label }}</div>
            </div>
          </div>
        </div>

        <div class="track">
          <span
            v-for="r in trophies"
            :key="r.rarity"
            class="seg"
            :style="{
              width: segmentWidth(r.unlocked),
              background: rarityColor[r.rarity],
            }"
          />
        </div>

        <div class="foot">
          <span>已获得 {{ summary.unlocked }} / {{ summary.total }}</span>
          <span v-if="remaining">还差 {{ remaining }} 个全收集</span>
          <span v-else class="done">全部获得</span>
        </div>
      </n-card>

      <n-tabs v-model:value="tab" type="line" class="tabs">
        <n-tab name="all">全部</n-tab>
        <n-tab name="unlocked">已获得</n-tab>
        <n-tab name="locked">未获得</n-tab>
        <n-tab name="badges">题单奖章</n-tab>
      </n-tabs>

      <div v-if="tab !== 'badges'" class="grid">
        <AchievementCard v-for="a in filtered" :key="a.id" :achievement="a" />
        <n-empty v-if="!filtered.length" description="这里还什么都没有" />
      </div>

      <div v-else class="grid">
        <n-card v-for="b in badges" :key="b.id" size="small">
          <div class="badge-row">
            <img v-if="b.badge?.icon" :src="b.badge.icon" class="badge-icon" />
            <div>
              <div class="badge-name">{{ b.badge?.name }}</div>
              <div class="badge-desc">{{ b.badge?.description }}</div>
            </div>
          </div>
        </n-card>
        <n-empty v-if="!badges.length" description="还没有获得任何题单奖章" />
      </div>
    </n-spin>
  </div>
</template>

<style scoped>
.hall {
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px;
}
.overview-row {
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
}

/* 等级铭牌：六边形靠 clip-path，老 Chrome 也支持 */
.level {
  flex: none;
  text-align: center;
}
.plate {
  width: 84px;
  height: 92px;
  display: flex;
  align-items: baseline;
  justify-content: center;
  clip-path: polygon(50% 0, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
  background: linear-gradient(
    180deg,
    rgba(128, 128, 128, 0.24),
    rgba(128, 128, 128, 0.1)
  );
}
.plate-num {
  font-size: 26px;
  font-weight: 700;
  line-height: 92px;
  font-variant-numeric: tabular-nums;
}
.plate-unit {
  font-size: 13px;
  opacity: 0.6;
  margin-left: 1px;
}
.plate-label {
  margin-top: 6px;
  font-size: 11px;
  letter-spacing: 3px;
  opacity: 0.55;
  padding-left: 3px; /* 抵消字距在末字后面留的空 */
}

/* 奖杯陈列 */
.trophies {
  flex: 1;
  min-width: 260px;
  display: flex;
  justify-content: space-around;
  gap: 8px;
}
.trophy {
  text-align: center;
  min-width: 56px;
}
.trophy.none {
  opacity: 0.35;
  filter: grayscale(1);
}
.trophy-count {
  margin-top: 4px;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}
.trophy-count b {
  font-size: 22px;
  font-weight: 700;
}
.trophy-count span {
  font-size: 12px;
  opacity: 0.5;
  margin-left: 3px;
}
.trophy-label {
  margin-top: 2px;
  font-size: 11px;
  letter-spacing: 2px;
  opacity: 0.55;
  padding-left: 2px;
}

/* 总进度条：四段拼起来正好是总完成度 */
.track {
  display: flex;
  height: 6px;
  margin-top: 20px;
  border-radius: 3px;
  overflow: hidden;
  background: rgba(128, 128, 128, 0.2); /* 灰底在明暗两套主题下都成立 */
}
.seg {
  height: 100%;
  transition: width 0.5s ease;
}
.foot {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.6;
}
.done {
  opacity: 0.9;
}

/* 移动端改成竖排：铭牌居中一行，四个奖杯等分下面一行 */
.mobile .overview-row {
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.mobile .plate {
  width: 72px;
  height: 80px;
}
.mobile .plate-num {
  font-size: 22px;
  line-height: 80px;
}
.mobile .trophies {
  width: 100%;
  min-width: 0;
  gap: 4px;
}
.mobile .trophy {
  flex: 1 1 0;
  min-width: 0;
}
.mobile .trophy svg {
  width: 26px;
  height: 26px;
}
.mobile .trophy-count b {
  font-size: 19px;
}
.mobile .trophy-label {
  letter-spacing: 1px;
  padding-left: 1px;
}
.mobile .track {
  margin-top: 16px;
}
.mobile .foot {
  font-size: 11px;
}

/* 这个留给系统偏好，和断点无关 */
@media (prefers-reduced-motion: reduce) {
  .seg {
    transition: none;
  }
}
.tabs {
  margin: 16px 0;
}
.grid {
  display: grid;
  /* min() 兜住窄屏：不加的话 300px 的下限会把 320 宽的手机撑出横向滚动 */
  grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
  gap: 12px;
}
.badge-row {
  display: flex;
  gap: 12px;
  align-items: center;
}
.badge-icon {
  width: 40px;
  height: 40px;
}
.badge-name {
  font-weight: 600;
}
.badge-desc {
  font-size: 12px;
  opacity: 0.7;
}
</style>

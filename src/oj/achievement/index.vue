<script setup lang="ts">
import { getAchievements, getAchievementSummary } from "oj/achievement/api"
import { getUserBadges } from "oj/api"
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

// 标签和进度条同色，整行读作一个单位
const rarityColor = useRarityColor()

const achievements = ref<Achievement[]>([])
const summary = ref<AchievementSummary | null>(null)

// 白金排最前，青铜垫底：稀有的先亮相，接口给的顺序是反的
const RARITY_RANK: Record<AchievementRarity, number> = {
  platinum: 0,
  gold: 1,
  silver: 2,
  bronze: 3,
}

const rarities = computed(() =>
  [...(summary.value?.rarity ?? [])].sort(
    (a, b) => RARITY_RANK[a.rarity] - RARITY_RANK[b.rarity],
  ),
)
const badges = ref<UserBadge[]>([])
const tab = ref("all")
const loading = ref(true)

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
  <div class="hall">
    <n-spin :show="loading">
      <n-card v-if="summary" class="overview">
        <div class="overview-row">
          <div class="percent">
            <n-progress
              type="circle"
              :percentage="summary.percent"
              :stroke-width="8"
            >
              <div class="ring-text">
                <div class="ring-percent">{{ summary.percent }}%</div>
              </div>
            </n-progress>
            <div class="sub">
              已获得 {{ summary.unlocked }} / {{ summary.total }}
            </div>
          </div>

          <div class="rarity">
            <div v-for="r in rarities" :key="r.rarity" class="rarity-item">
              <span
                class="rarity-label"
                :style="{ color: rarityColor[r.rarity] }"
              >
                {{ r.label }}
              </span>
              <span class="rarity-bar">
                <span
                  class="rarity-fill"
                  :style="{
                    width: r.total ? (r.unlocked / r.total) * 100 + '%' : '0%',
                    background: rarityColor[r.rarity],
                  }"
                />
              </span>
              <span class="rarity-count">
                <b>{{ r.unlocked }}</b> / {{ r.total }}
              </span>
            </div>
          </div>
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
  gap: 32px;
  flex-wrap: wrap;
}
.percent {
  flex: none;
  width: 110px;
  text-align: center;
}
.percent :deep(.n-progress) {
  width: 110px;
}
.ring-percent {
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
}
.sub {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.65;
  white-space: nowrap;
}
.rarity {
  flex: 1;
  min-width: 240px;
  /* 卡片有 1100px 宽，不封顶的话 6px 高的细条会被拉到近 900px，读起来很空 */
  max-width: 420px;
  display: grid;
  /* 固定单列，四条各占一行：折成两列会让进度条短得看不出差别 */
  grid-template-columns: 1fr;
  gap: 8px;
}
.rarity-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.rarity-label {
  flex: none;
  width: 30px;
  font-size: 13px;
  font-weight: 600;
}
.rarity-bar {
  flex: 1;
  height: 6px;
  min-width: 40px;
  border-radius: 3px;
  overflow: hidden;
  background: rgba(128, 128, 128, 0.2); /* 灰底在明暗两套主题下都成立 */
}
.rarity-fill {
  display: block;
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}
.rarity-count {
  flex: none;
  font-size: 12px;
  opacity: 0.7;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.rarity-count b {
  font-size: 13px;
  opacity: 0.9;
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

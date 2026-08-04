<script setup lang="ts">
import { getAchievements, getAchievementSummary } from "oj/achievement/api"
import { getUserBadges } from "oj/api"
import type { Achievement, AchievementSummary } from "utils/types"
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

const achievements = ref<Achievement[]>([])
const summary = ref<AchievementSummary | null>(null)
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
    achievements.value = list.achievements
    summary.value = sum
    badges.value = (badgeRes ?? []) as UserBadge[]
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
            <div class="big">{{ summary.percent }}%</div>
            <div class="sub">
              {{ summary.unlocked }} / {{ summary.total }} 已获得
            </div>
          </div>
          <div class="rarity">
            <div
              v-for="r in summary.rarity"
              :key="r.rarity"
              class="rarity-item"
            >
              <div class="rarity-label">{{ r.label }}</div>
              <div class="rarity-count">{{ r.unlocked }} / {{ r.total }}</div>
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
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.big {
  font-size: 40px;
  font-weight: 700;
  line-height: 1;
}
.sub {
  margin-top: 6px;
  font-size: 13px;
  opacity: 0.7;
}
.rarity {
  display: flex;
  gap: 20px;
}
.rarity-item {
  text-align: center;
}
.rarity-label {
  font-size: 12px;
  opacity: 0.7;
}
.rarity-count {
  font-weight: 600;
  margin-top: 2px;
}
.tabs {
  margin: 16px 0;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

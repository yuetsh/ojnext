<script setup lang="ts">
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
const { isDesktop } = useBreakpoints()
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
    <n-card v-if="summary">
      <n-flex align="center" :wrap="false" :size="isDesktop ? 32 : 16">
        <n-flex vertical align="center" :size="6">
          <n-progress
            type="circle"
            :percentage="summary.percent"
            :stroke-width="8"
          >
            <n-text strong>{{ summary.percent }}%</n-text>
          </n-progress>
          <n-text depth="3" class="nowrap">
            已获得 {{ summary.unlocked }} / {{ summary.total }}
          </n-text>
        </n-flex>

        <n-flex vertical :size="8" class="rarity">
          <n-flex
            v-for="r in rarities"
            :key="r.rarity"
            align="center"
            :wrap="false"
            :size="10"
          >
            <n-text strong :style="{ color: rarityColor[r.rarity] }">
              {{ r.label }}
            </n-text>
            <n-progress
              style="flex: 1"
              type="line"
              :percentage="r.total ? (r.unlocked / r.total) * 100 : 0"
              :height="6"
              :border-radius="3"
              :fill-border-radius="3"
              :color="rarityColor[r.rarity]"
              :show-indicator="false"
            />
            <n-text depth="3" class="nowrap">
              {{ r.unlocked }} / {{ r.total }}
            </n-text>
          </n-flex>
        </n-flex>
      </n-flex>
    </n-card>

    <n-tabs v-model:value="tab" type="line" class="tabs">
      <n-tab name="all">全部</n-tab>
      <n-tab name="unlocked">已获得</n-tab>
      <n-tab name="locked">未获得</n-tab>
      <n-tab name="badges">题单奖章</n-tab>
    </n-tabs>

    <template v-if="tab !== 'badges'">
      <n-grid
        v-if="filtered.length"
        responsive="screen"
        cols="1 s:2 l:3"
        :x-gap="12"
        :y-gap="12"
      >
        <n-gi v-for="a in filtered" :key="a.id">
          <AchievementCard :achievement="a" />
        </n-gi>
      </n-grid>
      <!-- 加载中不显示空态，不然首屏会闪一下"什么都没有" -->
      <n-empty v-else-if="!loading" description="这里还什么都没有" />
    </template>

    <template v-else>
      <n-grid
        v-if="badges.length"
        responsive="screen"
        cols="1 s:2 l:3"
        :x-gap="12"
        :y-gap="12"
      >
        <n-gi v-for="b in badges" :key="b.id">
          <n-card size="small">
            <n-thing :title="b.badge?.name" :description="b.badge?.description">
              <template #avatar v-if="b.badge?.icon">
                <n-avatar
                  :size="40"
                  :src="b.badge.icon"
                  color="transparent"
                  object-fit="contain"
                />
              </template>
            </n-thing>
          </n-card>
        </n-gi>
      </n-grid>
      <n-empty v-else-if="!loading" description="还没有获得任何题单奖章" />
    </template>
  </div>
</template>

<style scoped>
.hall {
  max-width: 1100px;
  margin: 0 auto;
  padding: 16px;
}
.rarity {
  flex: 1;
  max-width: 420px;
}
.nowrap {
  white-space: nowrap;
}
.tabs {
  margin: 16px 0;
}
</style>

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
  // 奖章来自哪个题单，接口在 UserBadgeSerializer 里带出来
  problemset: {
    id: number
    title: string
  } | null
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

// 数据是异步来的，卡片挂上去时百分比就是终值，CSS 过渡不会触发。
// 先按 0 渲染一帧，下一帧再填真值，圆环和进度条才有"长出来"的动画
const grown = ref(false)
const percent = computed(() =>
  grown.value ? (summary.value?.percent ?? 0) : 0,
)
function rarityPercent(r: { unlocked: number; total: number }) {
  if (!grown.value || !r.total) return 0
  return (r.unlocked / r.total) * 100
}
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
  grown.value = false
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
  // 等卡片以 0 渲染完这一帧，再切到真值
  await nextTick()
  requestAnimationFrame(() => requestAnimationFrame(() => (grown.value = true)))
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
            :percentage="percent"
            :stroke-width="8"
            class="grow"
          >
            <n-text strong>
              <n-number-animation
                :from="0"
                :to="summary.percent"
                :duration="900"
              />%
            </n-text>
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
              class="grow"
              type="line"
              :percentage="rarityPercent(r)"
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
              <n-text v-if="b.problemset" depth="3" class="source">
                来自题单
                <router-link
                  :to="{
                    name: 'problemset',
                    params: { problemSetId: b.problemset.id },
                  }"
                >
                  {{ b.problemset.title }}
                </router-link>
              </n-text>
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
.source {
  display: block;
  margin-top: 6px;
  font-size: 13px;
}
.source a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.source a:hover {
  color: var(--n-text-color);
}

/* naive 自带过渡，但圆环 stroke-dasharray 只有 .3s、线条 max-width 只有 .2s，
   配合 0 → 真值那一下太快看不出来，这里拉长 */
.grow :deep(.n-progress-graph-circle-fill) {
  transition:
    opacity 0.3s var(--n-bezier),
    stroke 0.3s var(--n-bezier),
    stroke-dasharray 0.9s cubic-bezier(0.25, 1, 0.5, 1);
}
.grow :deep(.n-progress-graph-line-fill) {
  transition:
    background-color 0.3s var(--n-bezier),
    max-width 0.9s cubic-bezier(0.25, 1, 0.5, 1);
}
@media (prefers-reduced-motion: reduce) {
  .grow :deep(.n-progress-graph-circle-fill),
  .grow :deep(.n-progress-graph-line-fill) {
    transition: none;
  }
}
</style>

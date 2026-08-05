<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { NH2, NH3 } from "naive-ui"
import { getProfile } from "shared/api"
import { useBreakpoints } from "shared/composables/breakpoints"
import { durationToDays, parseTime } from "utils/functions"
import type { AchievementSummary, Profile } from "utils/types"
import { getAchievementSummary } from "oj/achievement/api"
import { getMetrics } from "../api"
import AchievementIcon from "shared/components/AchievementIcon.vue"
import { useUserStore } from "shared/store/user"

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const profile = ref<Profile | null>(null)
const problems = ref<string[]>([])
const firstSubmissionAt = ref("")
const latestSubmissionAt = ref("")
const toLatestAt = ref("")
const learnDuration = ref("")
const achievementSummary = ref<AchievementSummary | null>(null)
const [loading, toggle] = useToggle()
const [show, toggleShow] = useToggle(false)

const { isDesktop } = useBreakpoints()

const isDefaultAvatar = computed(
  () => profile.value?.avatar.endsWith("default.png") ?? true,
)

const problemsFlexRef = useTemplateRef<HTMLElement>("problemsFlexRef")
const itemsPerRow = ref(8)

function updateItemsPerRow() {
  if (!problemsFlexRef.value) return
  const buttons = problemsFlexRef.value.querySelectorAll("button")
  if (!buttons.length) return
  const firstTop = buttons[0].offsetTop
  let count = 0
  for (const btn of buttons) {
    if (btn.offsetTop === firstTop) count++
    else break
  }
  if (count > 0) itemsPerRow.value = count
}

useResizeObserver(problemsFlexRef, updateItemsPerRow)
watch(problems, async () => {
  await nextTick()
  updateItemsPerRow()
})

const visibleProblems = computed(() =>
  show.value ? problems.value : problems.value.slice(0, itemsPerRow.value * 3),
)

const hasMoreProblems = computed(
  () => problems.value.length > itemsPerRow.value * 3,
)

async function init() {
  toggle(true)
  try {
    const res = await getProfile(route.query.name as string)
    profile.value = res.data
    const acm = res.data.acm_problems_status.problems || {}
    const ac: string[] = []
    Object.keys(acm).forEach((id) => {
      if (acm[id]["status"] === 0) {
        ac.push(acm[id]["_id"])
      }
    })
    ac.sort()
    problems.value = ac

    if (profile.value.submission_number > 0) {
      const metricsRes = await getMetrics(profile.value.user.id)
      firstSubmissionAt.value = parseTime(metricsRes.data.first)
      latestSubmissionAt.value = parseTime(metricsRes.data.latest)
      toLatestAt.value = durationToDays(
        metricsRes.data.latest,
        metricsRes.data.now,
      )
      learnDuration.value = durationToDays(
        metricsRes.data.first,
        metricsRes.data.latest,
      )
    }
  } finally {
    toggle(false)
  }
}

// 单独取，不塞进上面的 promises 数组：那里是按位置取 results[0]/[1] 的，
// 插一项进去会打乱既有索引。成就摘要取不到也不该影响整个个人主页
async function loadAchievementSummary() {
  try {
    const res = await getAchievementSummary(
      (route.query.name as string) || undefined,
    )
    achievementSummary.value = res.data
  } catch {
    achievementSummary.value = null
  }
}

const metrics = computed(() => {
  if (loading.value) return []
  return [
    {
      icon: "fluent-emoji:face-with-peeking-eye",
      title: learnDuration.value,
      content: "总共学习天数",
    },
    {
      icon: "fluent-emoji:cheese-wedge",
      title: toLatestAt.value,
      content: "距离上次提交",
    },
    {
      icon: "fluent-emoji:dog-face",
      title: latestSubmissionAt.value,
      content: "最新一次提交时间",
    },
    {
      icon: "fluent-emoji:cat-with-wry-smile",
      title: firstSubmissionAt.value,
      content: "第一次提交时间",
    },
    {
      icon: "fluent-emoji:candy",
      title: profile.value?.accepted_number ?? 0,
      content: "已解决的题目数量",
      animate: true,
    },
    {
      icon: "fluent-emoji:thinking-face",
      title: profile.value?.submission_number ?? 0,
      content: "总提交数量",
      animate: true,
    },
  ]
})

onMounted(() => {
  init()
  loadAchievementSummary()
})
</script>
<template>
  <n-flex
    class="wrapper"
    vertical
    justify="center"
    align="center"
    v-if="!loading && profile"
  >
    <n-image
      :width="140"
      :height="140"
      :src="profile.avatar"
      :preview-disabled="isDefaultAvatar"
      object-fit="cover"
      :style="{
        borderRadius: '50%',
        overflow: 'hidden',
        cursor: isDefaultAvatar ? 'default' : 'pointer',
      }"
    />
    <h2>{{ profile.user.username }}</h2>
    <p class="desc">{{ profile.mood }}</p>
    <n-button
      v-if="userStore.isSuperAdmin"
      type="info"
      secondary
      @click="
        router.push({
          name: 'ai',
          query: { username: profile.user.username, duration: 'months:6' },
        })
      "
    >
      智能分析
    </n-button>
  </n-flex>

  <n-grid
    v-if="profile && profile.submission_number > 0"
    class="wrapper"
    :cols="2"
    :x-gap="10"
    :y-gap="10"
  >
    <n-gi v-for="item in metrics" :key="item.content">
      <n-card hoverable>
        <n-flex align="center">
          <Icon v-if="isDesktop" :icon="item.icon" width="50" />
          <div>
            <Component :is="isDesktop ? NH2 : NH3" class="number">
              <n-number-animation v-if="item.animate" :to="item.title" />
              <template v-else>
                {{ item.title }}
              </template>
            </Component>
            <n-h4 class="number-label">{{ item.content }}</n-h4>
          </div>
        </n-flex>
      </n-card>
    </n-gi>
  </n-grid>

  <!-- 成就摘要 -->
  <n-card
    v-if="!loading && profile && achievementSummary"
    class="wrapper"
    hoverable
  >
    <n-flex align="center" justify="space-between">
      <n-flex align="center" :size="12">
        <span class="achievement-title">
          成就 {{ achievementSummary.unlocked }} /
          {{ achievementSummary.total }}
        </span>
        <n-tag size="small" type="info">
          {{ achievementSummary.percent }}%
        </n-tag>
      </n-flex>
      <n-button
        text
        type="primary"
        @click="
          router.push({
            path: '/achievement',
            query: route.query.name ? { name: route.query.name } : {},
          })
        "
      >
        查看全部
      </n-button>
    </n-flex>
    <n-flex align="center" :size="10" class="achievement-recent">
      <n-text v-if="achievementSummary.recent.length" depth="3">
        最近获得
      </n-text>
      <n-tooltip v-for="a in achievementSummary.recent" :key="a.id">
        <template #trigger>
          <span class="achievement-icon">
            <AchievementIcon :icon="a.icon" :size="24" />
          </span>
        </template>
        {{ a.name }}
      </n-tooltip>
      <n-text v-if="!achievementSummary.recent.length" depth="3">
        还没有获得成就
      </n-text>
    </n-flex>
  </n-card>

  <n-descriptions v-if="!loading && profile" class="wrapper" bordered>
    <n-descriptions-item v-if="!!problems.length">
      <template #label>
        <n-flex justify="space-between" align="center">
          <span>已解决的题目</span>
          <n-button
            text
            type="primary"
            v-if="hasMoreProblems"
            @click="toggleShow(!show)"
          >
            {{ show ? "隐藏全部" : "显示全部" }}
          </n-button>
        </n-flex>
      </template>
      <div ref="problemsFlexRef">
        <n-flex>
          <n-button
            v-for="id in visibleProblems"
            :key="id"
            @click="router.push('/problem/' + id)"
          >
            {{ id }}
          </n-button>
        </n-flex>
      </div>
    </n-descriptions-item>
  </n-descriptions>
  <n-empty v-if="!loading && !profile" description="该用户不存在">
    <template #extra>
      <n-button @click="router.push('/')">返回主页</n-button>
    </template>
  </n-empty>
</template>
<style scoped>
.wrapper {
  max-width: 610px;
  margin: 16px auto 0;
}

.number {
  margin-bottom: 0;
  font-weight: bold;
}

.number-label {
  margin: 0;
}

h2 {
  margin: 0;
  font-weight: normal;
}

.desc {
  margin: 0 auto;
  word-wrap: break-word;
  max-width: 100%;
}
.achievement-title {
  font-weight: 600;
}
.achievement-recent {
  margin-top: 10px;
}
.achievement-icon {
  display: inline-flex;
  align-items: center;
  font-size: 24px;
  cursor: default;
}
</style>

<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { NH2, NH3 } from "naive-ui"
import { getProfile } from "~/shared/api"
import { isDesktop } from "~/shared/composables/breakpoints"
import { durationToDays, parseTime } from "~/utils/functions"
import { Profile } from "~/utils/types"
import { getMetrics } from "../api"

const route = useRoute()
const router = useRouter()
const profile = ref<Profile | null>(null)
const problems = ref<string[]>([])
const firstSubmissionAt = ref("")
const latestSubmissionAt = ref("")
const toLatestAt = ref("")
const learnDuration = ref("")
const [loading, toggle] = useToggle()

async function init() {
  toggle(true)
  try {
    const res = await getProfile(<string>route.query.name)
    profile.value = res.data
    const acm = res.data.acm_problems_status.problems || {}
    const oi = res.data.oi_problems_status.problems || {}
    const ac: string[] = []
    for (let problems of [acm, oi]) {
      Object.keys(problems).forEach((id) => {
        if (problems[id]["status"] === 0) {
          ac.push(problems[id]["_id"])
        }
      })
    }
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

const metrics = computed(() => {
  if (loading.value) return []
  return [
    {
      icon: "fluent-emoji:face-with-peeking-eye",
      title: learnDuration.value ?? "1天",
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
    },
    {
      icon: "fluent-emoji:thinking-face",
      title: profile.value?.submission_number ?? 0,
      content: "总提交数量",
    },
  ]
})

onMounted(init)
</script>
<template>
  <n-flex
    class="wrapper"
    vertical
    justify="center"
    align="center"
    v-if="!loading && profile"
  >
    <n-avatar round :size="140" :src="profile.avatar" />
    <h2>{{ profile.user.username }}</h2>
    <p class="desc">{{ profile.mood }}</p>
  </n-flex>

  <n-grid
    v-if="profile && profile.submission_number > 0"
    class="wrapper"
    :cols="2"
    :x-gap="10"
    :y-gap="10"
  >
    <n-gi v-for="item in metrics" :key="item.title">
      <n-card hoverable>
        <n-flex align="center">
          <Icon v-if="isDesktop" :icon="item.icon" width="50" />
          <div>
            <Component :is="isDesktop ? NH2 : NH3" class="number">
              {{ item.title }}
            </Component>
            <n-h4 class="number-label">{{ item.content }}</n-h4>
          </div>
        </n-flex>
      </n-card>
    </n-gi>
  </n-grid>

  <n-descriptions v-if="!loading && profile" class="wrapper" bordered>
    <n-descriptions-item v-if="problems.length" label="已解决的题目">
      <n-flex>
        <n-button
          v-for="id in problems"
          key="id"
          @click="router.push('/problem/' + id)"
        >
          {{ id }}
        </n-button>
      </n-flex>
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
  margin: 0;
}
</style>

<script setup lang="ts">
import { Icon } from "@iconify/vue"
import {
  getProblemSetDetail,
  getProblemSetProblems,
  joinProblemSet,
  getUserBadges,
} from "../api"
import { getTagColor } from "utils/functions"
import {
  ProblemSet,
  ProblemSetProblem,
  UserBadge as UserBadgeType,
} from "utils/types"
import { DIFFICULTY } from "utils/constants"
import { useBreakpoints } from "shared/composables/breakpoints"
import UserBadge from "shared/components/UserBadge.vue"
import { useFireworks } from "../problem/composables/useFireworks"

const route = useRoute()
const router = useRouter()
const message = useMessage()

const { isDesktop } = useBreakpoints()
const { celebrate } = useFireworks()

const problemSetId = computed(() => Number(route.params.problemSetId))

const problemSet = ref<ProblemSet | null>(null)
const problems = ref<ProblemSetProblem[]>([])
const isJoined = ref(false)
const isJoining = ref(false)
const userBadges = ref<UserBadgeType[]>([])

function getDifficultyTag(difficulty: string) {
  const difficultyMap: Record<
    string,
    { type: "success" | "warning" | "error" | "default"; text: string }
  > = {
    Easy: { type: "success", text: "简单" },
    Medium: { type: "warning", text: "中等" },
    Hard: { type: "error", text: "困难" },
  }
  return difficultyMap[difficulty] || { type: "default", text: "未知" }
}

function getProgressPercentage() {
  if (!problemSet.value) return 0
  return Math.round(
    (problemSet.value.completed_count / problemSet.value.problems_count) * 100,
  )
}

async function loadProblemSetDetail() {
  const res = await getProblemSetDetail(problemSetId.value)
  problemSet.value = res.data
  isJoined.value = res.data.user_progress?.is_joined || false
}

async function loadProblems() {
  const res = await getProblemSetProblems(problemSetId.value)
  problems.value = res.data
}

async function loadUserBadges() {
  if (!isJoined.value) return

  const res = await getUserBadges()
  userBadges.value = res.data.filter(
    (badge: UserBadgeType) => badge.badge.problemset === problemSetId.value,
  )
}

async function init() {
  await Promise.all([loadProblemSetDetail(), loadProblems()])
  if (isJoined.value) {
    if (problemSet.value?.user_progress?.is_completed) {
      celebrate()
    }
    loadUserBadges()
  }
}

async function handleProblemClick(problemId: string) {
  if (!isJoined.value) {
    message.warning("请先点击【加入题单】按钮！")
    return
  }
  router.push({
    name: "problemset problem",
    params: {
      problemSetId: problemSetId.value,
      problemID: problemId,
    },
  })
}

async function handleJoinProblemSet() {
  if (isJoining.value) return

  isJoining.value = true
  try {
    await joinProblemSet(problemSetId.value)
    isJoined.value = true
    message.success("成功加入题单！")
    // 加入题单后加载用户徽章
    await loadUserBadges()
  } catch (err: any) {
    message.error("加入题单失败：" + (err.data || "未知错误"))
  } finally {
    isJoining.value = false
  }
}

onMounted(init)
</script>

<template>
  <n-card v-if="problemSet" style="margin-bottom: 24px">
    <n-flex justify="space-between" align="center">
      <n-flex align="center">
        <n-tag type="warning" v-if="problemSet.status === 'archived'">
          已归档
        </n-tag>
        <n-tag :type="getDifficultyTag(problemSet.difficulty).type">
          {{ getDifficultyTag(problemSet.difficulty).text }}
        </n-tag>
        <n-h2 style="margin: 0">{{ problemSet.title }}</n-h2>
        <n-tooltip trigger="hover" v-if="problemSet.description">
          <template #trigger>
            <Icon width="20" icon="emojione:information" />
          </template>
          {{ problemSet.description }}
        </n-tooltip>
      </n-flex>

      <n-flex align="center">
        <!-- 用户徽章显示区域 - 只在已加入且有徽章时显示 -->
        <n-flex v-if="isJoined && userBadges.length > 0" align="center">
          <n-text>已获徽章</n-text>
          <UserBadge
            v-for="badge in userBadges"
            :key="badge.id"
            :badge="badge"
          />
        </n-flex>

        <!-- 完成进度 - 只在已加入时显示 -->
        <n-flex align="center" v-if="isJoined">
          <n-text strong>完成进度</n-text>
          <n-text>
            {{ problemSet.completed_count }} / {{ problemSet.problems_count }}
          </n-text>
        </n-flex>
        <n-progress
          v-if="isJoined"
          :percentage="getProgressPercentage()"
          :height="8"
          :border-radius="4"
          style="width: 200px"
        />
        <n-button
          v-if="!isJoined"
          type="primary"
          size="large"
          :loading="isJoining"
          @click="handleJoinProblemSet"
        >
          加入题单
        </n-button>
        <n-tag v-else type="success" size="large">
          <template #icon>
            <Icon icon="material-symbols:check-circle" />
          </template>
          已加入
        </n-tag>
      </n-flex>
    </n-flex>
  </n-card>
  <n-grid v-if="problemSet" :cols="isDesktop ? 4 : 1" :x-gap="16" :y-gap="16">
    <n-grid-item
      v-for="(problemSetProblem, index) in problems"
      :key="problemSetProblem.id"
    >
      <n-card
        hoverable
        @click="handleProblemClick(problemSetProblem.problem._id)"
        style="cursor: pointer"
      >
        <n-flex align="center">
          <Icon
            style="margin-right: 12px"
            width="50"
            icon="noto:check-mark-button"
            v-if="problemSetProblem.is_completed"
          />

          <n-flex vertical style="flex: 1">
            <n-flex align="center">
              <n-h4 style="margin: 0">#{{ index + 1 }}</n-h4>
              <n-h4 style="margin: 0">
                {{ problemSetProblem.problem.title }}
              </n-h4>
            </n-flex>

            <n-flex align="center" size="small">
              <n-tag
                :type="getTagColor(problemSetProblem.problem.difficulty)"
                size="small"
              >
                {{ DIFFICULTY[problemSetProblem.problem.difficulty] }}
              </n-tag>
              <n-text type="info"> 分数：{{ problemSetProblem.score }} </n-text>
              <n-text v-if="!problemSetProblem.is_required"> （选做） </n-text>
            </n-flex>
          </n-flex>
        </n-flex>
      </n-card>
    </n-grid-item>
  </n-grid>

  <div class="tip">
    <n-text :deep="3">* 题目完成后会自动返回题单页面</n-text>
  </div>
</template>

<style scoped>
.tip {
  padding: 24px;
  text-align: center;
}
</style>

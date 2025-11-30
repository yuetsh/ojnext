<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { ProblemSet, UserBadge as UserBadgeType } from "utils/types"
import UserBadge from "shared/components/UserBadge.vue"
import { useUserStore } from "shared/store/user"

interface Props {
  problemSet: ProblemSet
  isJoined: boolean
  isJoining: boolean
  userBadges: UserBadgeType[]
}

interface Emits {
  (e: 'join'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const userStore = useUserStore()

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
  if (!props.problemSet) return 0
  return Math.round(
    (props.problemSet.completed_count / props.problemSet.problems_count) * 100,
  )
}

function handleJoin() {
  emit('join')
}
</script>

<template>
  <n-card style="margin-bottom: 24px;">
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

      <n-flex align="center" v-if="userStore.isAuthed">
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
          @click="handleJoin"
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
</template>

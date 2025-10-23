<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { ProblemSetProblem } from "utils/types"
import { DIFFICULTY } from "utils/constants"
import { getTagColor } from "utils/functions"
import { useBreakpoints } from "shared/composables/breakpoints"

interface Props {
  problems: ProblemSetProblem[]
  isJoined: boolean
}

interface Emits {
  (e: 'problem-click', problemId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { isDesktop } = useBreakpoints()

function handleProblemClick(problemId: string) {
  emit('problem-click', problemId)
}
</script>

<template>
  <div>
    <n-grid :cols="isDesktop ? 4 : 1" :x-gap="16" :y-gap="16">
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
              style="margin-right: 10px"
              width="48"
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
                <n-text type="info">分数：{{ problemSetProblem.score }}</n-text>
                <n-text v-if="!problemSetProblem.is_required">（选做）</n-text>
              </n-flex>
            </n-flex>
          </n-flex>
        </n-card>
      </n-grid-item>
    </n-grid>
    <div class="tip">
      <n-text depth="3">题目完成后会自动返回题单页面</n-text>
    </div>
  </div>
</template>

<style scoped>
.tip {
  padding-top: 24px;
  text-align: center;
}
</style>

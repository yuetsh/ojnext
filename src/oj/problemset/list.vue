<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { useRouteQuery } from "@vueuse/router"
import { getProblemSetList } from "../api"
import { parseTime } from "utils/functions"
import { ProblemSetList } from "utils/types"
import Pagination from "shared/components/Pagination.vue"
import { usePagination } from "shared/composables/pagination"
import { useBreakpoints } from "shared/composables/breakpoints"

const router = useRouter()
const { isDesktop } = useBreakpoints()

const total = ref(0)
const problemSets = ref<ProblemSetList[]>([])

interface ProblemSetQuery {
  keyword: string
  difficulty: string
  status: string
}

// 使用分页 composable
const { query, clearQuery } = usePagination<ProblemSetQuery>({
  keyword: useRouteQuery("keyword", "").value,
  difficulty: useRouteQuery("difficulty", "").value,
  status: useRouteQuery("status", "").value,
})

const difficultyOptions = [
  { label: "全部", value: "" },
  { label: "简单", value: "Easy" },
  { label: "中等", value: "Medium" },
  { label: "困难", value: "Hard" },
]

const statusOptions = [
  { label: "全部", value: "" },
  { label: "活跃", value: "active" },
  { label: "已归档", value: "archived" },
]

async function listProblemSets() {
  if (query.page < 1) query.page = 1
  const offset = (query.page - 1) * query.limit
  const res = await getProblemSetList(
    offset,
    query.limit,
    query.keyword,
    query.difficulty,
    query.status,
  )
  total.value = res.data.total
  problemSets.value = res.data.results
}

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

function goToProblemSet(problemSetId: number) {
  router.push(`/problemset/${problemSetId}`)
}

function getConditionText(
  conditionType: string,
  conditionValue: number,
): string {
  const conditionMap: Record<string, string> = {
    all_problems: "完成所有题目",
    problem_count: `完成 ${conditionValue} 道题目`,
    score: `达到 ${conditionValue} 分`,
  }
  return conditionMap[conditionType] || "未知条件"
}

function getProgressColor(percentage: number) {
  if (percentage >= 80) return "#18a058" // 绿色
  if (percentage >= 50) return "#f0a020" // 橙色
  return "#d03050" // 红色
}

onMounted(listProblemSets)

// 监听搜索关键词变化（防抖）
watchDebounced(() => query.keyword, listProblemSets, {
  debounce: 500,
  maxWait: 1000,
})

// 监听其他查询条件变化
watch(
  () => [query.page, query.limit, query.difficulty, query.status],
  listProblemSets,
)
</script>

<template>
  <n-flex vertical size="large">
    <n-space>
      <n-space align="center">
        <n-text>难度</n-text>
        <n-select
          v-model:value="query.difficulty"
          :options="difficultyOptions"
          placeholder="选择难度"
          style="width: 120px"
          clearable
        />
      </n-space>
      <n-space align="center">
        <n-text>状态</n-text>
        <n-select
          v-model:value="query.status"
          :options="statusOptions"
          placeholder="选择状态"
          style="width: 120px"
          clearable
        />
      </n-space>
      <n-input
        v-model:value="query.keyword"
        placeholder="搜索题单..."
        clearable
        @clear="clearQuery"
        style="width: 200px"
      />
    </n-space>

    <n-grid
      v-if="problemSets.length > 0"
      :cols="isDesktop ? 3 : 1"
      :x-gap="16"
      :y-gap="16"
    >
      <n-grid-item v-for="problemSet in problemSets" :key="problemSet.id">
        <n-card
          hoverable
          @click="goToProblemSet(problemSet.id)"
          style="cursor: pointer"
        >
          <template #header>
            <n-flex justify="space-between" align="center">
              <n-text strong>{{ problemSet.title }}</n-text>
              <n-tag :type="getDifficultyTag(problemSet.difficulty).type">
                {{ getDifficultyTag(problemSet.difficulty).text }}
              </n-tag>
            </n-flex>
          </template>
          <n-flex vertical size="large">
            <n-flex justify="space-between" align="center">
              <n-flex>
                <Icon width="20" icon="streamline-emojis:blossom" />
                <n-text>{{ problemSet.problems_count }} 道题目</n-text>
              </n-flex>

              <n-flex align="center" style="height: 28px">
                <!-- 用户进度显示 -->
                <n-progress
                  v-if="
                    problemSet.user_progress?.is_joined &&
                    !problemSet.user_progress?.is_completed
                  "
                  type="line"
                  :percentage="
                    Math.round(problemSet.user_progress.progress_percentage)
                  "
                  :height="4"
                  :border-radius="2"
                  style="width: 100px"
                  :color="
                    getProgressColor(
                      problemSet.user_progress.progress_percentage,
                    )
                  "
                />
                <n-tag type="warning" v-if="problemSet.status === 'archived'">
                  已归档
                </n-tag>
                <n-tag
                  v-if="
                    problemSet.user_progress?.is_joined &&
                    !problemSet.user_progress?.is_completed
                  "
                  type="warning"
                >
                  已加入
                </n-tag>
                <n-tag
                  v-if="problemSet.user_progress?.is_completed"
                  type="error"
                >
                  已完成
                </n-tag>
              </n-flex>
            </n-flex>

            <!-- 奖章显示 -->
            <n-flex
              v-if="problemSet.badges && problemSet.badges.length > 0"
              align="center"
              justify="space-between"
            >
              <n-text depth="3">
                创建于
                {{ parseTime(problemSet.create_time, "YYYY-MM-DD") }}
              </n-text>
              <n-flex>
                <n-tooltip
                  v-for="badge in problemSet.badges"
                  :key="badge.id"
                  trigger="hover"
                >
                  <template #trigger>
                    <n-image
                      :src="badge.icon"
                      :alt="badge.name"
                      width="24"
                      height="24"
                      object-fit="cover"
                      :class="{ 'earned-badge': badge.is_earned }"
                    />
                  </template>
                  <n-flex vertical size="small">
                    <span style="font-weight: bold">
                      徽章: {{ badge.name }}
                    </span>
                    <span>
                      获取条件:
                      {{
                        getConditionText(
                          badge.condition_type,
                          badge.condition_value,
                        )
                      }}
                    </span>
                    <n-text type="primary" v-if="badge.is_earned">
                      ✓ 已获得
                    </n-text>
                  </n-flex>
                </n-tooltip>
              </n-flex>
            </n-flex>
          </n-flex>
        </n-card>
      </n-grid-item>
    </n-grid>

    <Pagination
      v-if="problemSets.length > 0"
      :total="total"
      v-model:limit="query.limit"
      v-model:page="query.page"
    />
  </n-flex>
  <n-empty v-if="problemSets.length === 0"></n-empty>
</template>

<style scoped>
.earned-badge {
  border: 2px solid #ffd700;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.4);
}
</style>

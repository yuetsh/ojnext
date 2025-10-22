<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { getProblemSetStatistics } from "oj/api"
import { ProblemSetStatistics } from "utils/types"
import { useBreakpoints } from "shared/composables/breakpoints"
import { NTag } from "naive-ui"
import { h } from "vue"

interface Props {
  problemSetId: number
}

const props = defineProps<Props>()

const { isDesktop } = useBreakpoints()
const message = useMessage()

const statistics = ref<ProblemSetStatistics | null>(null)
const loading = ref(false)

// 结果状态映射
const resultStatusMap: Record<string, { text: string; type: string }> = {
  "-2": { text: "编译错误", type: "error" },
  "-1": { text: "答案错误", type: "error" },
  "0": { text: "通过", type: "success" },
  "1": { text: "时间超限", type: "warning" },
  "2": { text: "时间超限", type: "warning" },
  "3": { text: "内存超限", type: "warning" },
  "4": { text: "运行时错误", type: "error" },
  "5": { text: "系统错误", type: "error" },
  "6": { text: "等待中", type: "info" },
  "7": { text: "评测中", type: "info" },
  "8": { text: "部分通过", type: "warning" },
}

async function loadStatistics() {
  loading.value = true
  try {
    const res = await getProblemSetStatistics(props.problemSetId)
    statistics.value = res.data
  } catch (err: any) {
    message.error("加载统计信息失败：" + (err.data || "未知错误"))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStatistics()
})
</script>

<template>
  <n-flex vertical size="large" v-if="statistics">
    <!-- 总体统计 -->
    <n-card title="总体统计">
      <n-grid :cols="isDesktop ? 4 : 2" :x-gap="16" :y-gap="16">
        <n-grid-item>
          <n-statistic label="总提交数" :value="statistics.total_submissions">
            <template #prefix>
              <Icon icon="streamline-emojis:file" />
            </template>
          </n-statistic>
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="通过数" :value="statistics.accepted_submissions">
            <template #prefix>
              <Icon icon="streamline-emojis:check-mark" />
            </template>
          </n-statistic>
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="通过率" :value="`${statistics.acceptance_rate}%`">
            <template #prefix>
              <Icon icon="streamline-emojis:chart-increasing" />
            </template>
          </n-statistic>
        </n-grid-item>
        <n-grid-item>
          <n-statistic label="完成进度" :value="`${statistics.progress.progress_percentage.toFixed(1)}%`">
            <template #prefix>
              <Icon icon="streamline-emojis:target" />
            </template>
          </n-statistic>
        </n-grid-item>
      </n-grid>
    </n-card>

    <!-- 进度信息 -->
    <n-card title="题单进度">
      <n-flex vertical size="medium">
        <n-flex justify="space-between" align="center">
          <n-text>完成题目数</n-text>
          <n-text strong>
            {{ statistics.progress.completed_problems_count }} / {{ statistics.progress.total_problems_count }}
          </n-text>
        </n-flex>
        <n-progress
          :percentage="statistics.progress.progress_percentage"
          :height="8"
          :border-radius="4"
        />
        <n-flex justify="space-between" align="center">
          <n-text>总得分</n-text>
          <n-text strong>{{ statistics.progress.total_score }} 分</n-text>
        </n-flex>
      </n-flex>
    </n-card>

    <!-- 题目统计 -->
    <n-card title="题目统计">
      <n-data-table
        :columns="[
          {
            title: '题目',
            key: 'problem_title',
            minWidth: 200,
          },
          {
            title: '总提交',
            key: 'total_submissions',
            width: 100,
          },
          {
            title: '通过',
            key: 'accepted_submissions',
            width: 100,
          },
          {
            title: '状态',
            key: 'is_completed',
            width: 100,
            render: (row) => {
              return h(
                NTag,
                {
                  type: row.is_completed ? 'success' : 'default',
                },
                () => row.is_completed ? '已完成' : '未完成'
              )
            },
          },
        ]"
        :data="Object.values(statistics.problem_stats)"
        :pagination="false"
      />
    </n-card>

    <!-- 语言统计 -->
    <n-card title="语言统计" v-if="Object.keys(statistics.language_stats).length > 0">
      <n-flex vertical size="small">
        <n-flex
          v-for="(count, language) in statistics.language_stats"
          :key="language"
          justify="space-between"
          align="center"
        >
          <n-text>{{ language }}</n-text>
          <n-text strong>{{ count }} 次</n-text>
        </n-flex>
      </n-flex>
    </n-card>

    <!-- 结果统计 -->
    <n-card title="结果统计" v-if="Object.keys(statistics.result_stats).length > 0">
      <n-flex vertical size="small">
        <n-flex
          v-for="(count, result) in statistics.result_stats"
          :key="result"
          justify="space-between"
          align="center"
        >
          <n-tag
            :type="(resultStatusMap[String(result)]?.type as any) || 'default'"
            size="small"
          >
            {{ resultStatusMap[String(result)]?.text || '未知' }}
          </n-tag>
          <n-text strong>{{ count }} 次</n-text>
        </n-flex>
      </n-flex>
    </n-card>
  </n-flex>

  <n-empty v-else-if="!loading" description="暂无统计信息" />
  <n-spin v-else size="large" />
</template>

<style scoped></style>

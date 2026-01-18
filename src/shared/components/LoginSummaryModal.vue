<script setup lang="ts">
import { MdPreview } from "md-editor-v3"
import "md-editor-v3/lib/preview.css"
import { useBreakpoints } from "shared/composables/breakpoints"
import { useLoginSummaryStore } from "shared/store/loginSummary"
import { parseTime } from "utils/functions"

const loginSummaryStore = useLoginSummaryStore()
const { isDesktop } = useBreakpoints()

const rangeText = computed(() => {
  const summary = loginSummaryStore.summary
  if (!summary?.start || !summary?.end) {
    return ""
  }
  const start = parseTime(summary.start, "YYYY-MM-DD HH:mm")
  const end = parseTime(summary.end, "YYYY-MM-DD HH:mm")
  return `${start} - ${end}`
})

const hasAnalysis = computed(() => !!loginSummaryStore.analysis)

</script>

<template>
  <n-modal
    v-model:show="loginSummaryStore.show"
    preset="card"
    title="登录速报"
    style="width: min(760px, 92vw)"
  >
    <n-spin :show="loginSummaryStore.loading" size="small">
      <n-flex vertical size="large">
        <n-text v-if="rangeText">统计区间：{{ rangeText }}</n-text>
        <n-grid :cols="isDesktop ? 3 : 1" :x-gap="16" :y-gap="16">
          <n-gi>
            <n-statistic
              label="新增题目"
              :value="loginSummaryStore.summary?.new_problem_count ?? 0"
            />
          </n-gi>
          <n-gi>
            <n-statistic
              label="提交次数"
              :value="loginSummaryStore.summary?.submission_count ?? 0"
            />
          </n-gi>
          <n-gi>
            <n-statistic
              label="AC 次数"
              :value="loginSummaryStore.summary?.accepted_count ?? 0"
            />
          </n-gi>
          <n-gi>
            <n-statistic
              label="AC 题目数"
              :value="loginSummaryStore.summary?.solved_count ?? 0"
            />
          </n-gi>
          <n-gi>
            <n-statistic
              label="流程图提交"
              :value="loginSummaryStore.summary?.flowchart_submission_count ?? 0"
            />
          </n-gi>
        </n-grid>

        <n-divider>AI 分析</n-divider>
        <n-alert
          v-if="loginSummaryStore.analysisError"
          type="warning"
          :show-icon="false"
        >
          {{ loginSummaryStore.analysisError }}
        </n-alert>
        <MdPreview
          v-if="hasAnalysis"
          :model-value="loginSummaryStore.analysis"
        />
        <n-empty
          v-else
          description="提交数少于 3 次，暂不生成 AI 分析"
        />
      </n-flex>
    </n-spin>
  </n-modal>
</template>

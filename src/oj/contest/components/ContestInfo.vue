<script setup lang="ts">
import { parseTime } from "utils/functions"
import { useContestStore } from "oj/store/contest"
import ContestType from "~/shared/ContestType.vue"

const contestStore = useContestStore()
</script>

<template>
  <n-popover
    v-if="contestStore.contest"
    trigger="click"
    placement="bottom-end"
    :show-arrow="false"
  >
    <template #trigger>
      <n-button>
        <template #icon>
          <i-ep-warning />
        </template>
        比赛信息
      </n-button>
    </template>
    <div v-html="contestStore.contest.description"></div>
    <n-descriptions bordered label-placement="left" :column="1">
      <n-descriptions-item label="开始时间">
        {{
          parseTime(contestStore.contest.start_time, "YYYY年M月D日 HH:mm:ss")
        }}
      </n-descriptions-item>
      <n-descriptions-item label="结束时间">
        {{ parseTime(contestStore.contest.end_time, "YYYY年M月D日 HH:mm:ss") }}
      </n-descriptions-item>
      <n-descriptions-item label="比赛类型">
        <ContestType :contest="contestStore.contest" />
      </n-descriptions-item>
      <n-descriptions-item label="发起人">
        {{ contestStore.contest.created_by.username }}
      </n-descriptions-item>
    </n-descriptions>
  </n-popover>
</template>

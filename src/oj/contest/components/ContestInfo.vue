<script setup lang="ts">
import { parseTime } from "utils/functions"
import { useContestStore } from "oj/store/contest"
import ContestTypeVue from "./ContestType.vue"
import { isDesktop } from "~/shared/composables/breakpoints"

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
      <n-button>比赛信息</n-button>
    </template>
    <n-descriptions bordered :column="isDesktop ? 4 : 1">
      <n-descriptions-item label="开始时间">
        {{
          parseTime(contestStore.contest.start_time, "YYYY年M月D日 hh:mm:ss")
        }}
      </n-descriptions-item>
      <n-descriptions-item label="结束时间">
        {{ parseTime(contestStore.contest.end_time, "YYYY年M月D日 hh:mm:ss") }}
      </n-descriptions-item>
      <n-descriptions-item label="比赛类型">
        <ContestTypeVue :contest="contestStore.contest" />
      </n-descriptions-item>
      <n-descriptions-item label="发起人">
        {{ contestStore.contest.created_by.username }}
      </n-descriptions-item>
    </n-descriptions>
  </n-popover>
</template>

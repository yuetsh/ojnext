<script setup lang="ts">
import { Contest } from "utils/types"
import { CONTEST_STATUS, ContestStatus, ContestType } from "utils/constants"
import { parseTime } from "utils/functions"
import { getContest, getContestAccess } from "../api"
import { isDesktop } from "~/shared/composables/breakpoints"
const props = defineProps<{
  contestID: string
}>()
const contest = ref<Contest>()
async function init() {
  const res = await getContest(props.contestID)
  contest.value = res.data
  if (contest.value?.contest_type === ContestType.private) {
    const res = await getContestAccess(props.contestID)
    // TODO: 这里 access 的逻辑不清楚
    console.log(res.data)
  }
}
onMounted(init)
</script>

<template>
  <n-card v-if="contest">
    <template #header>
      <n-space align="center">
        <n-tag :type="CONTEST_STATUS[contest.status]['type']">
          {{ CONTEST_STATUS[contest.status]["name"] }}
        </n-tag>
        <span>{{ contest.title }}</span>
        <n-icon
          v-if="contest.contest_type === ContestType.private"
          class="lockIcon"
        >
          <i-ep-lock />
        </n-icon>
      </n-space>
    </template>
    <div v-html="contest.description"></div>
    <n-descriptions bordered :column="isDesktop ? 5 : 2">
      <n-descriptions-item
        :span="isDesktop ? 1 : 2"
        v-if="contest.status !== ContestStatus.finished"
      >
        <template #label>
          <span v-if="contest.status === ContestStatus.not_started">
            距离比赛开始还有
          </span>
          <span v-if="contest.status === ContestStatus.underway">
            距离比赛结束还有
          </span>
        </template>
        <n-space align="center">
          <n-tag :type="CONTEST_STATUS[contest.status]['type']">
            <n-countdown :duration="500000" />
          </n-tag>
        </n-space>
      </n-descriptions-item>
      <n-descriptions-item label="开始时间">
        {{ parseTime(contest.start_time, "YYYY年M月D日 hh:mm:ss") }}
      </n-descriptions-item>
      <n-descriptions-item label="结束时间">
        {{ parseTime(contest.end_time, "YYYY年M月D日 hh:mm:ss") }}
      </n-descriptions-item>
      <n-descriptions-item label="比赛类型">
        {{ contest.contest_type === ContestType.private ? "需要密码" : "公开" }}
      </n-descriptions-item>
      <n-descriptions-item label="发起人">
        {{ contest.created_by.username }}
      </n-descriptions-item>
    </n-descriptions>
  </n-card>
</template>

<style scoped>
.lockIcon {
  transform: translateY(2px);
}
</style>

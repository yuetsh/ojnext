<script setup lang="ts">
import { CONTEST_STATUS, ContestStatus, ContestType } from "utils/constants"
import { parseTime } from "utils/functions"
import { isDesktop } from "~/shared/composables/breakpoints"
import ContestTypeVue from "./components/ContestType.vue"
import { useContestStore } from "../store/contest"

const props = defineProps<{
  contestID: string
}>()
const contestStore = useContestStore()
const route = useRoute()
const router = useRouter()
const password = ref("")

onMounted(() => contestStore.init(props.contestID))

const contestMenuVisible = computed(() => {
  if (contestStore.isContestAdmin) return true
  if (contestStore.contest?.contest_type === ContestType.public) {
    // TODO:这里没有完成
  }
  return contestStore.access
})

const passwordFormVisible = computed(
  () =>
    contestStore.contest?.contest_type === ContestType.private &&
    !contestStore.access &&
    !contestStore.isContestAdmin
)

function goto(name: string) {
  router.push({ name: "contest " + name })
}

function getCurrentType(name: string): "primary" | "default" {
  if (route.name === "contest " + name) return "primary"
  return "default"
}
</script>

<template>
  <div v-if="contestStore.contest">
    <n-space align="center">
      <n-tag :type="CONTEST_STATUS[contestStore.contest.status]['type']">
        {{ CONTEST_STATUS[contestStore.contest.status]["name"] }}
      </n-tag>
      <h2 class="contestTitle">{{ contestStore.contest.title }}</h2>
      <n-icon
        v-if="contestStore.contest.contest_type === ContestType.private"
        class="lockIcon"
      >
        <i-ep-lock />
      </n-icon>
    </n-space>
    <div v-html="contestStore.contest.description"></div>
    <n-form :inline="isDesktop" label-placement="left">
      <n-form-item v-if="passwordFormVisible" label="需要输入密码才能看到题目">
        <n-input
          name="ContestPassword"
          type="password"
          v-model:value="password"
        />
      </n-form-item>
      <n-form-item v-if="passwordFormVisible">
        <n-button
          @click="contestStore.checkPassword(contestID, password)"
          :disabled="!password"
        >
          确认
        </n-button>
      </n-form-item>
      <n-form-item v-if="contestMenuVisible">
        <n-space>
          <n-button
            :type="getCurrentType('problems')"
            @click="goto('problems')"
          >
            比赛题目
          </n-button>
          <n-button
            :type="getCurrentType('submissions')"
            @click="goto('submissions')"
          >
            提交信息
          </n-button>
          <n-button :type="getCurrentType('rank')" @click="goto('rank')">
            比赛排名
          </n-button>
          <n-button
            v-if="contestStore.isContestAdmin"
            :type="getCurrentType('helper')"
            @click="goto('helper')"
          >
            管理员助手
          </n-button>
        </n-space>
      </n-form-item>
    </n-form>
    <n-descriptions class="bottom" bordered :column="isDesktop ? 5 : 2">
      <n-descriptions-item
        :span="isDesktop ? 1 : 2"
        v-if="contestStore.contest.status !== ContestStatus.finished"
      >
        <template #label>
          <span
            v-if="contestStore.contest.status === ContestStatus.not_started"
          >
            距离比赛开始还有
          </span>
          <span v-if="contestStore.contest.status === ContestStatus.underway">
            距离比赛结束还有
          </span>
        </template>
        <n-space align="center">
          <n-tag :type="CONTEST_STATUS[contestStore.contest.status]['type']">
            <n-countdown :duration="500000" />
          </n-tag>
        </n-space>
      </n-descriptions-item>
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
    <router-view></router-view>
  </div>
</template>

<style scoped>
.contestTitle {
  font-weight: 500;
  margin: 0;
}
.lockIcon {
  transform: translateY(2px);
}

.bottom {
  margin-bottom: 24px;
}
</style>

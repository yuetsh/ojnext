<script setup lang="ts">
import { CONTEST_STATUS, ContestType } from "utils/constants"

import { isDesktop, isMobile } from "~/shared/composables/breakpoints"
import { useContestStore } from "../store/contest"
import { DropdownOption } from "naive-ui"
import ContestInfo from "./components/ContestInfo.vue"

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

const options = computed<DropdownOption[]>(() => [
  { label: "比赛题目", key: "problems" },
  { label: "提交信息", key: "submissions" },
  { label: "比赛排名", key: "rank" },
  { label: "管理员助手", key: "helper", show: contestStore.isContestAdmin },
])
</script>

<template>
  <div v-if="contestStore.contest">
    <n-space align="center" justify="space-between">
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
      <n-space v-if="contestMenuVisible">
        <ContestInfo />
        <n-space v-if="isDesktop">
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
        <n-dropdown
          v-if="isMobile"
          :options="options"
          trigger="click"
          @select="goto"
        >
          <n-button>菜单</n-button>
        </n-dropdown>
      </n-space>
    </n-space>
    <div v-html="contestStore.contest.description"></div>
    <n-form
      :inline="isDesktop"
      label-placement="left"
      v-if="passwordFormVisible"
    >
      <n-form-item label="需要输入密码才能看到题目">
        <n-input
          name="ContestPassword"
          type="password"
          v-model:value="password"
        />
      </n-form-item>
      <n-form-item>
        <n-button
          @click="contestStore.checkPassword(contestID, password)"
          :disabled="!password"
        >
          确认
        </n-button>
      </n-form-item>
    </n-form>
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
</style>

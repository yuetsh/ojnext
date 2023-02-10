<script setup lang="ts">
import { CONTEST_STATUS } from "utils/constants"
import { isDesktop } from "~/shared/composables/breakpoints"
import { useContestStore } from "../store/contest"
import ContestInfo from "./components/ContestInfo.vue"
import ContestMenu from "./components/ContestMenu.vue"

const props = defineProps<{
  contestID: string
}>()
const contestStore = useContestStore()

const password = ref("")

onMounted(() => contestStore.init(props.contestID))

const passwordFormVisible = computed(
  () =>
    contestStore.isPrivate &&
    !contestStore.access &&
    !contestStore.isContestAdmin
)
</script>

<template>
  <div v-if="contestStore.contest">
    <n-space class="title" align="center" justify="space-between">
      <n-space align="center">
        <n-tag :type="CONTEST_STATUS[contestStore.contest.status]['type']">
          {{ CONTEST_STATUS[contestStore.contest.status]["name"] }}
        </n-tag>
        <h2 class="contestTitle">{{ contestStore.contest.title }}</h2>
        <n-icon v-if="contestStore.isPrivate" class="lockIcon">
          <i-ep-lock />
        </n-icon>
      </n-space>
      <n-space>
        <ContestInfo />
        <ContestMenu />
      </n-space>
    </n-space>
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
.title {
  margin-bottom: 16px;
}

.contestTitle {
  font-weight: 500;
  margin: 0;
}
.lockIcon {
  transform: translateY(2px);
}
</style>

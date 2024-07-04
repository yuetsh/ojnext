<script setup lang="ts">
import { Icon } from "@iconify/vue"
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

onMounted(() => {
  contestStore.init(props.contestID)
})

onBeforeUnmount(() => {
  contestStore.clear()
})

const passwordFormVisible = computed(
  () =>
    contestStore.isPrivate &&
    !contestStore.access &&
    !contestStore.isContestAdmin,
)
</script>

<template>
  <n-flex vertical size="large" v-if="contestStore.contest">
    <n-flex align="center" justify="space-between">
      <n-flex align="center">
        <n-tag :type="CONTEST_STATUS[contestStore.contestStatus]['type']">
          {{ contestStore.countdown }}
        </n-tag>
        <Icon
          v-if="contestStore.isPrivate"
          icon="streamline-emojis:locked-with-key"
          :width="30"
          :height="30"
        ></Icon>
        <h2 class="contestTitle">{{ contestStore.contest.title }}</h2>
      </n-flex>
      <n-flex align="center">
        <ContestInfo />
        <ContestMenu />
      </n-flex>
    </n-flex>
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
  </n-flex>
</template>

<style scoped>
.contestTitle {
  font-weight: 500;
  margin: 0;
}
</style>

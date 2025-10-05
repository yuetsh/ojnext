<script setup lang="ts">
import { useContestStore } from "oj/store/contest"
import { isDesktop } from "shared/composables/breakpoints"
import { ContestStatus } from "utils/constants"

const route = useRoute()
const router = useRouter()
const contestStore = useContestStore()

const contestMenuVisible = computed(() => {
  if (contestStore.isContestAdmin) return true
  if (!contestStore.isPrivate) {
    return contestStore.contestStatus !== ContestStatus.not_started
  }
  return contestStore.access
})

function goto(name: string) {
  router.push({ name: "contest " + name })
}

function getCurrentType(name: string): "primary" | "default" {
  if (route.name === "contest " + name) return "primary"
  return "default"
}

const options: DropdownOption[] = [
  { label: "比赛题目", key: "problems" },
  { label: "提交信息", key: "submissions" },
  { label: "比赛排名", key: "rank" },
]
</script>
<template>
  <div v-if="contestMenuVisible">
    <n-flex v-if="isDesktop">
      <n-button :type="getCurrentType('problems')" @click="goto('problems')">
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
    </n-flex>
    <n-dropdown v-else :options="options" @select="goto">
      <n-button>菜单</n-button>
    </n-dropdown>
  </div>
</template>
<style scoped></style>

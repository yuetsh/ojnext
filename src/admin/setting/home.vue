<script setup lang="ts">
import { useUserStore } from "~/shared/store/user"
import { getBaseInfo } from "../api"

const userCount = ref(0)
const submissionCount = ref(0)
const contestCount = ref(0)
const userStore = useUserStore()
const router = useRouter()

onMounted(async () => {
  const res = await getBaseInfo()
  userCount.value = res.data.user_count
  submissionCount.value = res.data.today_submission_count
  contestCount.value = res.data.recent_contest_count
})
</script>

<template>
  <n-space align="center">
    <n-avatar round :size="60" :src="userStore.profile?.avatar"></n-avatar>
    <h1 class="name">{{ userStore.user?.username }}</h1>
  </n-space>
  <h2>
    <n-gradient-text type="info">总用户数：{{ userCount }}</n-gradient-text>
  </h2>
  <h2>
    <n-gradient-text type="error">
      今日提交：{{ submissionCount }}
    </n-gradient-text>
  </h2>
  <h2>
    <n-gradient-text type="warning">
      近期比赛：{{ contestCount }}
    </n-gradient-text>
  </h2>
  <n-space align="center">
    <span>我猜你要：</span>
    <n-button @click="router.push('/admin/problem/create')">新题目</n-button>
    <n-button @click="router.push('/admin/contest/create')">新比赛</n-button>
  </n-space>
</template>

<style scoped>
.name {
  font-size: 48px;
  margin: 0;
}
</style>

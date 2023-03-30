<script setup lang="ts">
import { getProfile } from "~/shared/api"
import { Profile } from "~/utils/types"

const route = useRoute()
const profile = ref<Profile | null>(null)
const problems = ref<string[]>([])
const [loading, toggle] = useToggle()

async function init() {
  toggle(true)
  try {
    const res = await getProfile(<string>route.query.name)
    profile.value = res.data
    const acm = res.data.acm_problems_status.problems || {}
    const oi = res.data.oi_problems_status.problems || {}
    const ac: string[] = []
    for (let problems of [acm, oi]) {
      Object.keys(problems).forEach((problemID) => {
        if (problems[problemID]["status"] === 0) {
          ac.push(problems[problemID]["_id"])
        }
      })
    }
    ac.sort()
    problems.value = ac
  } finally {
    toggle(false)
  }
}

onMounted(init)
</script>
<template>
  <n-space vertical justify="center" align="center" v-if="!loading && profile">
    <n-avatar round :size="140" :src="profile.avatar" />
    <h2>{{ profile.user.username }}</h2>
    <p class="desc">{{ profile.mood }}</p>
  </n-space>
  <n-descriptions
    v-if="!loading && profile"
    class="wrapper"
    bordered
    :column="2"
    label-style="width: 50%"
  >
    <n-descriptions-item label="已解决的题目数量">
      {{ profile.accepted_number }}
    </n-descriptions-item>
    <n-descriptions-item label="总提交数">
      {{ profile.submission_number }}
    </n-descriptions-item>
    <n-descriptions-item v-if="problems.length" label="已解决的题目" :span="2">
      <n-space>
        <n-button
          v-for="id in problems"
          key="id"
          @click="$router.push('/problem/' + id)"
        >
          {{ id }}
        </n-button>
      </n-space>
    </n-descriptions-item>
  </n-descriptions>
  <n-empty v-if="!loading && !profile" description="该用户不存在">
    <template #extra>
      <n-button @click="$router.push('/')">返回主页</n-button>
    </template>
  </n-empty>
</template>
<style scoped>
.wrapper {
  max-width: 600px;
  margin: 16px auto 0;
}

h2 {
  margin: 0;
  font-weight: normal;
}

.desc {
  margin: 0;
}
</style>

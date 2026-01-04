<script setup lang="ts">
import { getUserClassRank } from "oj/api"
import { useUserStore } from "shared/store/user"
import { NButton } from "naive-ui"

const userStore = useUserStore()
const router = useRouter()
const message = useMessage()

interface UserRank {
  rank: number
  username: string
  accepted_number: number
  submission_number: number
}

const myRank = ref(-1)
const className = ref("")
const data = ref<UserRank[]>([])
const loading = ref(false)

const columns: DataTableColumn<UserRank>[] = [
  {
    title: "排名",
    key: "rank",
    width: 100,
    align: "center",
  },
  {
    title: "用户名",
    key: "username",
    width: 200,
    render: (row) =>
      h(
        NButton,
        {
          text: true,
          type: "info",
          onClick: () => router.push("/user?name=" + row.username),
        },
        () => row.username,
      ),
  },
  {
    title: "AC数",
    key: "accepted_number",
    width: 120,
    align: "center",
  },
  {
    title: "提交数",
    key: "submission_number",
    width: 120,
    align: "center",
  },
]

async function init() {
  loading.value = true
  try {
    if (!userStore.user) {
      await userStore.getMyProfile()
    }
    const user = userStore.user
    if (!user || !user.class_name) {
      message.warning("您没有班级信息")
      return
    }

    const res = await getUserClassRank()
    myRank.value = res.data.my_rank
    className.value = res.data.class_name
    data.value = res.data.ranks
  } finally {
    loading.value = false
  }
}

onMounted(init)
</script>

<template>
  <n-flex vertical size="large" v-if="!loading">
    <n-h2>我的班级排名</n-h2>
    <n-alert v-if="className" type="info">
      班级：{{ className }} | 我的排名：{{
        myRank > 0 ? `第${myRank}名` : "暂无排名"
      }}
      | 班级总人数：{{ data.length }}
    </n-alert>
    <n-alert v-else type="warning"> 您还没有加入班级 </n-alert>

    <n-data-table :data="data" :columns="columns" />
  </n-flex>
</template>

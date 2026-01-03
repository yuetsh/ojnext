<script setup lang="ts">
import { getUserClassRank } from "oj/api"
import { useUserStore } from "shared/store/user"
import Pagination from "shared/components/Pagination.vue"
import { renderTableTitle } from "utils/renders"
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
const totalUsers = ref(0)
const className = ref("")
const data = ref<UserRank[]>([])
const total = ref(0)
const query = reactive({
  limit: 20,
  page: 1,
})

const columns: DataTableColumn<UserRank>[] = [
  {
    title: renderTableTitle("排名", "streamline-emojis:flexed-biceps-1"),
    key: "rank",
    width: 100,
    align: "center",
    render: (row) => {
      if (row.rank === 1) return "🥇"
      if (row.rank === 2) return "🥈"
      if (row.rank === 3) return "🥉"
      return row.rank
    },
  },
  {
    title: renderTableTitle(
      "用户名",
      "streamline-emojis:smiling-face-with-sunglasses",
    ),
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
    title: renderTableTitle("AC数", "streamline-emojis:raised-fist-1"),
    key: "accepted_number",
    width: 120,
    align: "center",
  },
  {
    title: renderTableTitle("提交数", "streamline-emojis:rocket"),
    key: "submission_number",
    width: 120,
    align: "center",
  },
]

async function init() {
  const user = userStore.user
  if (!user || !user.class_name) {
    message.warning("您没有班级信息")
    return
  }

  const offset = (query.page - 1) * query.limit
  const res = await getUserClassRank(offset, query.limit)
  myRank.value = res.data.my_rank
  totalUsers.value = res.data.total_users
  className.value = res.data.class_name
  data.value = res.data.ranks.results
  total.value = res.data.ranks.total
}

watch(() => query.page, init)
watch(
  () => query.limit,
  () => {
    query.page = 1
    init()
  },
)

onMounted(init)
</script>

<template>
  <n-flex vertical size="large">
    <n-h2>我的班级排名</n-h2>
    <n-alert v-if="className" type="info">
      班级：{{ className }} | 我的排名：{{
        myRank > 0 ? `第${myRank}名` : "暂无排名"
      }}
      | 班级总人数：{{ totalUsers }}
    </n-alert>
    <n-alert v-else type="warning"> 您还没有加入班级 </n-alert>

    <n-data-table :data="data" :columns="columns" />
    <Pagination
      :total="total"
      v-model:page="query.page"
      v-model:limit="query.limit"
    />
  </n-flex>
</template>


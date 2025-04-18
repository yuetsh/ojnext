<script setup lang="ts">
import { NButton } from "naive-ui"
import { getRank } from "oj/api"
import Pagination from "~/shared/components/Pagination.vue"
import { useUserStore } from "~/shared/store/user"
import { getACRate } from "~/utils/functions"
import { Rank } from "~/utils/types"
import { getBaseInfo, randomUser10 } from "../api"

const userCount = ref(0)
const submissionCount = ref(0)
const contestCount = ref(0)
const userStore = useUserStore()
const router = useRouter()
const message = useMessage()

const showModal = ref(false)
const luckyGuy = ref("")
const data = ref<Rank[]>([])
const total = ref(0)
const query = reactive({
  limit: 10,
  page: 1,
  classroom: "",
})

const columns: DataTableColumn<Rank>[] = [
  {
    title: "排名",
    key: "index",
    width: 80,
    align: "center",
    render: (_, index) => index + (query.page - 1) * query.limit + 1,
  },
  {
    title: "用户",
    key: "username",
    width: 200,
    render: (row) =>
      h(
        NButton,
        {
          text: true,
          type: "info",
          onClick: () => router.push("/user?name=" + row.user.username),
        },
        () => row.user.username,
      ),
  },
  { title: "个性签名", key: "mood" },
  { title: "已解决", key: "accepted_number", width: 100 },
  { title: "提交数", key: "submission_number", width: 100 },
  {
    title: "正确率",
    key: "rate",
    width: 100,
    render: (row) => getACRate(row.accepted_number, row.submission_number),
  },
]

onMounted(async () => {
  const res = await getBaseInfo()
  userCount.value = res.data.user_count
  submissionCount.value = res.data.today_submission_count
  contestCount.value = res.data.recent_contest_count
})

async function listRanks() {
  const offset = (query.page - 1) * query.limit
  const res = await getRank(offset, query.limit, 0, query.classroom)
  data.value = res.data.results
  total.value = res.data.total
}

async function getRandom() {
  const res = await randomUser10(query.classroom)
  const name = res.data[res.data.length - 1]
  luckyGuy.value = name.split(query.classroom)[1]
}

async function getRandomModal() {
  try {
    await getRandom()
    showModal.value = true
  } catch (error) {
    message.error("没有学生")
  }
}

watch(() => query.page, listRanks)
watch(
  () => query.limit,
  () => {
    query.page = 1
    listRanks()
  },
)

watch(
  () => query.classroom,
  (v) => {
    query.page = 1
    if (!v) {
      data.value = []
      total.value = 0
    }
  },
)

watch(showModal, (v) => {
  if (!v) luckyGuy.value = ""
})
</script>

<template>
  <n-flex align="center">
    <n-avatar round :size="60" :src="userStore.profile?.avatar" />
    <h1 class="name">亲爱的管理员：{{ userStore.user?.username }}</h1>
  </n-flex>
  <n-flex>
    <h2>
      <n-gradient-text type="info"> 总用户数：{{ userCount }} </n-gradient-text>
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
  </n-flex>
  <n-flex align="center" class="actions">
    <span>我猜你要：</span>
    <n-button @click="router.push('/admin/problem/create')">新题目</n-button>
    <n-button @click="router.push('/admin/contest/create')">新比赛</n-button>
    <div>
      <n-input
        style="width: 200px"
        clearable
        v-model:value="query.classroom"
        placeholder="班级前缀"
      />
    </div>
    <n-button @click="listRanks">用户排名</n-button>
    <n-button @click="getRandomModal" v-if="query.classroom">随机抽签</n-button>
    <Pagination
      class="pagination"
      :total="total"
      v-model:page="query.page"
      v-model:limit="query.limit"
    />
  </n-flex>
  <n-data-table v-if="data.length" striped :data="data" :columns="columns" />
  <n-modal
    preset="card"
    title="猜猜看幸运儿是谁？"
    v-model:show="showModal"
    style="width: 400px"
  >
    <n-flex vertical justify="center" align="center">
      <n-h1 class="lucky">{{ luckyGuy }}</n-h1>
      <n-button block @click="getRandom">再来一次</n-button>
    </n-flex>
  </n-modal>
</template>

<style scoped>
.name {
  font-size: 32px;
  margin: 0;
}

.actions {
  margin-bottom: 20px;
}

.pagination {
  margin: 0;
}

.lucky {
  height: 48px;
}
</style>

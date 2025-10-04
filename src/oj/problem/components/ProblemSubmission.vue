<script lang="ts" setup>
import { NButton } from "naive-ui"
import { getSubmissions, getRankOfProblem } from "~/oj/api"
import Pagination from "~/shared/components/Pagination.vue"
import SubmissionResultTag from "~/shared/components/SubmissionResultTag.vue"
import { useUserStore } from "~/shared/store/user"
import { LANGUAGE_SHOW_VALUE } from "~/utils/constants"
import { parseTime } from "~/utils/functions"
import { renderTableTitle } from "~/utils/renders"
import { Submission } from "~/utils/types"

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const columns: DataTableColumn<Submission>[] = [
  {
    title: renderTableTitle("提交时间", "noto:seven-oclock"),
    key: "create_time",
    width: 200,
    render: (row) => parseTime(row.create_time, "YYYY-MM-DD HH:mm:ss"),
  },
  {
    title: renderTableTitle("编号", "fluent-emoji-flat:input-numbers"),
    key: "id",
    minWidth: 160,
    render: (row) => {
      if (row.show_link) {
        return h(
          NButton,
          {
            text: true,
            type: "info",
            onClick: () => {
              const data = router.resolve("/submission/" + row.id)
              window.open(data.href, "_blank")
            },
          },
          () => row.id.slice(0, 12),
        )
      } else {
        return row.id.slice(0, 12)
      }
    },
  },
  {
    title: renderTableTitle("状态", "streamline-emojis:panda-face"),
    key: "status",
    width: 140,
    render: (row) => h(SubmissionResultTag, { result: row.result }),
  },
  {
    title: renderTableTitle(
      "语言",
      "streamline-emojis:globe-showing-europe-africa",
    ),
    key: "language",
    width: 100,
    render: (row) => LANGUAGE_SHOW_VALUE[row.language],
  },
]

const class_name = ref("")
const rank = ref(-1)
const class_ac_count = ref(0)
const all_ac_count = ref(0)
const loading = ref(false)

const submissions = ref<Submission[]>([])
const total = ref(0)
const query = reactive({
  limit: 10,
  page: 1,
})

const errorMsg = computed(() => {
  if (!userStore.isAuthed) return "请先登录"
  else if (!userStore.showSubmissions) return "提交列表已被管理员关闭"
  else return ""
})

async function listSubmissions() {
  const offset = query.limit * (query.page - 1)
  const res = await getSubmissions({
    ...query,
    myself: "1",
    offset,
    problem_id: <string>route.params.problemID ?? "",
    contest_id: <string>route.params.contestID ?? "",
  })
  submissions.value = res.data.results
  total.value = res.data.total
}

async function getRankOfThisProblem() {
  loading.value = true
  const res = await getRankOfProblem(<string>route.params.problemID ?? "")
  loading.value = false

  class_name.value = res.data.class_name
  rank.value = res.data.rank
  class_ac_count.value = res.data.class_ac_count
  all_ac_count.value = res.data.all_ac_count
}

onMounted(() => {
  listSubmissions()
  if (route.name === "problem") {
    getRankOfThisProblem()
  }
})
watch(query, listSubmissions)
</script>
<template>
  <n-alert
    class="tip"
    type="error"
    v-if="!userStore.showSubmissions || !userStore.isAuthed"
    :title="errorMsg"
  />

  <template v-if="!loading && route.name === 'problem' && userStore.isAuthed">
    <template v-if="class_name">
      <n-alert class="tip" type="success" :show-icon="false" v-if="rank !== -1">
        <template #header>
          <n-flex align="center">
            <span>
              本道题你在班上排名第 <b>{{ rank }}</b
              >，你们班共有 <b>{{ class_ac_count }}</b> 人答案正确
            </span>
            <n-button
              secondary
              v-if="userStore.showSubmissions"
              @click="
                router.push({
                  name: 'submissions',
                  query: {
                    problem: route.params.problemID,
                    result: '0',
                    page: 1,
                    limit: 10,
                    username: 'ks' + class_name,
                  },
                })
              "
            >
              查看
            </n-button>
          </n-flex>
        </template>
      </n-alert>
      <n-alert
        class="tip"
        type="error"
        :show-icon="false"
        v-if="rank === -1 && class_ac_count > 0"
      >
        <template #header>
          <n-flex align="center">
            <span>
              本道题你还没有解决，你们班共有 <b>{{ class_ac_count }}</b> 人答案正确
            </span>
            <n-button
              v-if="userStore.showSubmissions"
              secondary
              @click="
                router.push({
                  name: 'submissions',
                  query: {
                    problem: route.params.problemID,
                    result: '0',
                    page: 1,
                    limit: 10,
                    username: 'ks' + class_name,
                  },
                })
              "
            >
              查看
            </n-button>
          </n-flex>
        </template>
      </n-alert>
    </template>
    <template v-else>
      <n-alert class="tip" type="success" :show-icon="false" v-if="rank !== -1">
        <template #header>
          <n-flex align="center">
            <span>
              本道题你在全服排名第 <b>{{ rank }}</b
              >，全服共有 <b>{{ all_ac_count }}</b> 人答案正确
            </span>
            <n-button
              secondary
              v-if="userStore.showSubmissions"
              @click="
                router.push({
                  name: 'submissions',
                  query: {
                    problem: route.params.problemID,
                    result: '0',
                    page: 1,
                    limit: 10,
                  },
                })
              "
            >
              查看
            </n-button>
          </n-flex>
        </template>
      </n-alert>
      <n-alert
        class="tip"
        type="error"
        :show-icon="false"
        v-if="rank === -1 && all_ac_count > 0"
      >
        <template #header>
          <n-flex align="center">
            <span>
              本道题你还没有解决，全服共有 <b>{{ all_ac_count }}</b> 人答案正确
            </span>
            <n-button
              v-if="userStore.showSubmissions"
              secondary
              @click="
                router.push({
                  name: 'submissions',
                  query: {
                    problem: route.params.problemID,
                    result: '0',
                    page: 1,
                    limit: 10,
                  },
                })
              "
            >
              查看
            </n-button>
          </n-flex>
        </template>
      </n-alert>
    </template>
  </template>

  <template v-if="userStore.showSubmissions && userStore.isAuthed">
    <n-data-table v-if="submissions.length > 0" striped :columns="columns" :data="submissions" />
    <Pagination
      :total="total"
      v-model:limit="query.limit"
      v-model:page="query.page"
    />
  </template>
</template>

<style scoped>
.tip {
  margin-bottom: 16px;
}
</style>

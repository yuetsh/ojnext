<script setup lang="ts">
import { Contest, Problem } from "utils/types"
import { CONTEST_STATUS, ContestStatus, ContestType } from "utils/constants"
import { getACRate, parseTime } from "utils/functions"
import {
  getContest,
  getContestAccess,
  getContestProblem,
  checkContestPassword,
} from "../api"
import { isDesktop } from "~/shared/composables/breakpoints"
import ContestTypeVue from "./components/ContestType.vue"
import { DataTableColumn } from "naive-ui"
import { useUserStore } from "~/shared/store/user"

const props = defineProps<{
  contestID: string
}>()
const router = useRouter()
const userStore = useUserStore()
const contest = ref<Contest>()
const problems = ref<Problem[]>([])
const password = ref("")
const [access, toggleAccsess] = useToggle()

async function init() {
  const res = await getContest(props.contestID)
  contest.value = res.data
  if (contest.value?.contest_type === ContestType.private) {
    const res = await getContestAccess(props.contestID)
    toggleAccsess(res.data.access)
  }
  getProblems()
}

async function getProblems() {
  try {
    const res = await getContestProblem(props.contestID)
    problems.value = res.data
  } catch (err) {
    toggleAccsess(false)
  }
}

async function checkPassword() {
  try {
    const res = await checkContestPassword(props.contestID, password.value)
    toggleAccsess(res.data)
    if (res.data) {
      getProblems()
    }
  } catch (err) {
    toggleAccsess(false)
  }
}
onMounted(init)
const isContestAdmin = computed(
  () =>
    userStore.isSuperAdmin ||
    (userStore.isAuthed && contest.value?.created_by.id === userStore.user.id)
)

const passwordFormVisible = computed(
  () =>
    contest.value?.contest_type === ContestType.private &&
    !access.value &&
    !isContestAdmin
)

const problemsColumns: DataTableColumn<Problem>[] = [
  { title: "编号", key: "_id", width: 100 },
  { title: "标题", key: "title" },
  { title: "总提交数", key: "submission_number", width: 100 },
  {
    title: "通过率",
    key: "rate",
    width: 100,
    render: (row) => getACRate(row.accepted_number, row.submission_number),
  },
]

function rowProps(row: Problem) {
  return {
    style: "cursor: pointer",
    onClick() {
      router.push(`/contest/${props.contestID}/problem/${row._id}`)
    },
  }
}
</script>

<template>
  <div v-if="contest">
    <n-space align="center">
      <n-tag :type="CONTEST_STATUS[contest.status]['type']">
        {{ CONTEST_STATUS[contest.status]["name"] }}
      </n-tag>
      <h2 class="contestTitle">{{ contest.title }}</h2>
      <n-icon
        v-if="contest.contest_type === ContestType.private"
        class="lockIcon"
      >
        <i-ep-lock />
      </n-icon>
    </n-space>
    <div v-html="contest.description"></div>
    <n-form inline label-placement="left">
      <n-form-item v-if="passwordFormVisible" label="需要输入密码才能看到题目">
        <n-input
          name="ContestPassword"
          type="password"
          v-model:value="password"
        />
      </n-form-item>
      <n-form-item v-if="passwordFormVisible">
        <n-button @click="checkPassword" :disabled="!password">确认</n-button>
      </n-form-item>
      <n-form-item>
        <n-space>
          <n-button type="primary">比赛题目</n-button>
          <n-button>提交信息</n-button>
          <n-button>比赛排名</n-button>
          <n-button>管理员助手</n-button>
        </n-space>
      </n-form-item>
    </n-form>
    <n-descriptions bordered :column="isDesktop ? 5 : 2">
      <n-descriptions-item
        :span="isDesktop ? 1 : 2"
        v-if="contest.status !== ContestStatus.finished"
      >
        <template #label>
          <span v-if="contest.status === ContestStatus.not_started">
            距离比赛开始还有
          </span>
          <span v-if="contest.status === ContestStatus.underway">
            距离比赛结束还有
          </span>
        </template>
        <n-space align="center">
          <n-tag :type="CONTEST_STATUS[contest.status]['type']">
            <n-countdown :duration="500000" />
          </n-tag>
        </n-space>
      </n-descriptions-item>
      <n-descriptions-item label="开始时间">
        {{ parseTime(contest.start_time, "YYYY年M月D日 hh:mm:ss") }}
      </n-descriptions-item>
      <n-descriptions-item label="结束时间">
        {{ parseTime(contest.end_time, "YYYY年M月D日 hh:mm:ss") }}
      </n-descriptions-item>
      <n-descriptions-item label="比赛类型">
        <ContestTypeVue :contest="contest" />
      </n-descriptions-item>
      <n-descriptions-item label="发起人">
        {{ contest.created_by.username }}
      </n-descriptions-item>
    </n-descriptions>
  </div>
  <n-data-table
    striped
    size="small"
    class="problems"
    :data="problems"
    :columns="problemsColumns"
    :row-props="rowProps"
    v-if="problems?.length"
  ></n-data-table>
</template>

<style scoped>
.contestTitle {
  font-weight: 500;
  margin: 0;
}
.lockIcon {
  transform: translateY(2px);
}

.problems {
  margin-top: 24px;
}
</style>

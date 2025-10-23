<script setup lang="ts">
import { NTabPane, NTabs, NButton, NFlex } from "naive-ui"
import {
  ProblemSet,
  ProblemSetProblem,
  ProblemSetBadge,
  ProblemSetProgress,
} from "utils/types"
import {
  getProblemSetDetail,
  getProblemSetProblems,
  getProblemSetBadges,
  getProblemSetProgress,
  addProblemToSet,
  editProblemInSet,
  removeProblemFromSet,
  createProblemSetBadge,
  editProblemSetBadge,
  deleteProblemSetBadge,
  removeUserFromProblemSet,
} from "../api"
import ProblemSetInfo from "./components/ProblemSetInfo.vue"
import ProblemManagement from "./components/ProblemManagement.vue"
import BadgeManagement from "./components/BadgeManagement.vue"
import ProgressManagement from "./components/ProgressManagement.vue"
import AddProblemModal from "./components/AddProblemModal.vue"
import EditProblemModal from "./components/EditProblemModal.vue"
import AddBadgeModal from "./components/AddBadgeModal.vue"
import EditBadgeModal from "./components/EditBadgeModal.vue"

const route = useRoute()
const router = useRouter()
const message = useMessage()

const problemSetId = computed(() => Number(route.params.problemSetId))

const problemSet = ref<ProblemSet | null>(null)
const problems = ref<ProblemSetProblem[]>([])
const badges = ref<ProblemSetBadge[]>([])
const progress = ref<ProblemSetProgress[]>([])

// 模态框状态
const showAddProblemModal = ref(false)
const showEditProblemModal = ref(false)
const showAddBadgeModal = ref(false)
const showEditBadgeModal = ref(false)

// 编辑数据
const editingProblem = ref<ProblemSetProblem | null>(null)
const editingBadge = ref<ProblemSetBadge | null>(null)

async function loadProblemSetDetail() {
  try {
    const res = await getProblemSetDetail(problemSetId.value)
    problemSet.value = res.data
  } catch (err: any) {
    message.error("加载题单详情失败：" + (err.data || "未知错误"))
  }
}

async function loadProblems() {
  try {
    const res = await getProblemSetProblems(problemSetId.value)
    problems.value = res.data
  } catch (err: any) {
    message.error("加载题目列表失败：" + (err.data || "未知错误"))
  }
}

async function loadBadges() {
  try {
    const res = await getProblemSetBadges(problemSetId.value)
    badges.value = res.data
  } catch (err: any) {
    message.error("加载奖章列表失败：" + (err.data || "未知错误"))
  }
}

async function loadProgress() {
  try {
    const res = await getProblemSetProgress(problemSetId.value)
    progress.value = res.data
  } catch (err: any) {
    message.error("加载进度列表失败：" + (err.data || "未知错误"))
  }
}

async function handleAddProblem(data: any) {
  try {
    await addProblemToSet(problemSetId.value, data)
    message.success("题目添加成功")
    showAddProblemModal.value = false
    loadProblems()
    loadProblemSetDetail() // 刷新题目数量
  } catch (err: any) {
    message.error("添加题目失败：" + (err.data || "未知错误"))
  }
}

async function handleRemoveProblem(problemSetProblemId: number) {
  try {
    await removeProblemFromSet(problemSetId.value, problemSetProblemId)
    message.success("题目移除成功")
    loadProblems()
    loadProblemSetDetail() // 刷新题目数量
  } catch (err: any) {
    message.error("移除题目失败：" + (err.data || "未知错误"))
  }
}

async function handleEditProblem(data: any) {
  if (!editingProblem.value) return

  try {
    await editProblemInSet(problemSetId.value, editingProblem.value.id, data)
    message.success("题目编辑成功")
    showEditProblemModal.value = false
    loadProblems()
  } catch (err: any) {
    message.error("编辑题目失败：" + (err.data || "未知错误"))
  }
}

async function handleAddBadge(data: any) {
  try {
    await createProblemSetBadge(problemSetId.value, data)
    message.success("奖章创建成功")
    showAddBadgeModal.value = false
    loadBadges()
  } catch (err: any) {
    message.error("创建奖章失败：" + (err.data || "未知错误"))
  }
}

async function handleDeleteBadge(badgeId: number) {
  try {
    await deleteProblemSetBadge(problemSetId.value, badgeId)
    message.success("奖章删除成功")
    loadBadges()
  } catch (err: any) {
    message.error("删除奖章失败：" + (err.data || "未知错误"))
  }
}

async function handleEditBadge(data: any) {
  if (!editingBadge.value) return

  try {
    await editProblemSetBadge(problemSetId.value, editingBadge.value.id, data)
    message.success("奖章编辑成功")
    showEditBadgeModal.value = false
    loadBadges()
  } catch (err: any) {
    message.error("编辑奖章失败：" + (err.data || "未知错误"))
  }
}

async function handleRemoveUser(userId: number) {
  try {
    await removeUserFromProblemSet(problemSetId.value, userId)
    message.success("用户移除成功")
    loadProgress()
  } catch (err: any) {
    message.error("移除用户失败：" + (err.data || "未知错误"))
  }
}

function openAddProblemModal() {
  showAddProblemModal.value = true
}

function openAddBadgeModal() {
  showAddBadgeModal.value = true
}

function openEditProblemModal(problem: ProblemSetProblem) {
  editingProblem.value = problem
  showEditProblemModal.value = true
}

function openEditBadgeModal(badge: ProblemSetBadge) {
  editingBadge.value = badge
  showEditBadgeModal.value = true
}

onMounted(() => {
  loadProblemSetDetail()
  loadProblems()
  loadBadges()
  loadProgress()
})
</script>

<template>
  <div v-if="problemSet">
    <n-flex class="titleWrapper" justify="space-between" align="center">
      <h2 class="title">{{ problemSet.title }}</h2>
      <n-button
        type="primary"
        @click="
          router.push({
            name: 'admin problemset edit',
            params: { problemSetId },
          })
        "
      >
        编辑题单
      </n-button>
    </n-flex>

    <ProblemSetInfo :problem-set="problemSet" />

    <n-tabs type="line">
      <n-tab-pane name="problems" tab="题目管理">
        <ProblemManagement
          :problems="problems"
          @add-problem="openAddProblemModal"
          @edit-problem="openEditProblemModal"
          @remove-problem="handleRemoveProblem"
        />
      </n-tab-pane>

      <n-tab-pane name="badges" tab="奖章管理">
        <BadgeManagement
          :badges="badges"
          @add-badge="openAddBadgeModal"
          @edit-badge="openEditBadgeModal"
          @delete-badge="handleDeleteBadge"
        />
      </n-tab-pane>

      <n-tab-pane name="progress" tab="进度管理">
        <ProgressManagement
          :progress="progress"
          @remove-user="handleRemoveUser"
        />
      </n-tab-pane>
    </n-tabs>

    <!-- 模态框组件 -->
    <AddProblemModal
      v-model:show="showAddProblemModal"
      @confirm="handleAddProblem"
    />

    <EditProblemModal
      v-model:show="showEditProblemModal"
      :problem="editingProblem"
      @confirm="handleEditProblem"
    />

    <AddBadgeModal v-model:show="showAddBadgeModal" @confirm="handleAddBadge" />

    <EditBadgeModal
      v-model:show="showEditBadgeModal"
      :badge="editingBadge"
      @confirm="handleEditBadge"
    />
  </div>
</template>

<style scoped>
.titleWrapper {
  margin-bottom: 16px;
}

.title {
  margin: 0;
}
</style>

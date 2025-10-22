<script setup lang="ts">
import { h } from "vue"
import { NTabPane, NTabs, NCard, NTag, NButton, NModal, NForm, NFormItem, NInput, NSelect, NSwitch, NInputNumber } from "naive-ui"
import { parseTime } from "utils/functions"
import { ProblemSet, ProblemSetProblem, ProblemSetBadge, ProblemSetProgress } from "utils/types"
import {
  getProblemSetDetail,
  getProblemSetProblems,
  getProblemSetBadges,
  getProblemSetProgress,
  addProblemToSet,
  removeProblemFromSet,
  createProblemSetBadge,
  deleteProblemSetBadge,
  removeUserFromProblemSet,
} from "../api"

const route = useRoute()
const router = useRouter()
const message = useMessage()

const problemSetId = computed(() => Number(route.params.problemSetId))

const problemSet = ref<ProblemSet | null>(null)
const problems = ref<ProblemSetProblem[]>([])
const badges = ref<ProblemSetBadge[]>([])
const progress = ref<ProblemSetProgress[]>([])

// 添加题目相关
const showAddProblemModal = ref(false)
const newProblemId = ref<number | null>(null)
const newProblemOrder = ref(0)
const newProblemRequired = ref(true)
const newProblemScore = ref(0)
const newProblemHint = ref("")

// 添加奖章相关
const showAddBadgeModal = ref(false)
const newBadgeName = ref("")
const newBadgeDescription = ref("")
const newBadgeIcon = ref("")
const newBadgeConditionType = ref<"all_problems" | "problem_count" | "score">("all_problems")
const newBadgeConditionValue = ref(1)
const newBadgeLevel = ref(1)

const conditionTypeOptions = [
  { label: "完成所有题目", value: "all_problems" },
  { label: "完成指定数量题目", value: "problem_count" },
  { label: "达到指定分数", value: "score" },
]

// 定义表格列
const progressColumns = [
  { title: '用户', key: 'user.username', width: 120 },
  { 
    title: '加入时间', 
    key: 'join_time', 
    width: 180, 
    render: (row: ProblemSetProgress) => parseTime(row.join_time, "YYYY-MM-DD HH:mm:ss") 
  },
  { title: '已完成', key: 'completed_problems_count', width: 100 },
  { title: '总题目', key: 'total_problems_count', width: 100 },
  { 
    title: '进度', 
    key: 'progress_percentage', 
    width: 100, 
    render: (row: ProblemSetProgress) => `${row.progress_percentage}%` 
  },
  { 
    title: '是否完成', 
    key: 'is_completed', 
    width: 100, 
    render: (row: ProblemSetProgress) => row.is_completed ? '是' : '否' 
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render: (row: ProblemSetProgress) => h(NButton, {
      size: 'small',
      type: 'error',
      secondary: true,
      onClick: () => handleRemoveUser(row.user.id)
    }, { default: () => '移除' })
  }
]

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

async function handleAddProblem() {
  if (!newProblemId.value) {
    message.error("请输入题目ID")
    return
  }

  try {
    await addProblemToSet(problemSetId.value, {
      problem_id: newProblemId.value,
      order: newProblemOrder.value,
      is_required: newProblemRequired.value,
      score: newProblemScore.value,
      hint: newProblemHint.value,
    })
    message.success("题目添加成功")
    showAddProblemModal.value = false
    loadProblems()
    loadProblemSetDetail() // 刷新题目数量
  } catch (err: any) {
    message.error("添加题目失败：" + (err.data || "未知错误"))
  }
}

async function handleRemoveProblem(problemId: number) {
  try {
    await removeProblemFromSet(problemSetId.value, problemId)
    message.success("题目移除成功")
    loadProblems()
    loadProblemSetDetail() // 刷新题目数量
  } catch (err: any) {
    message.error("移除题目失败：" + (err.data || "未知错误"))
  }
}

async function handleAddBadge() {
  if (!newBadgeName.value.trim()) {
    message.error("请输入奖章名称")
    return
  }

  try {
    await createProblemSetBadge(problemSetId.value, {
      name: newBadgeName.value,
      description: newBadgeDescription.value,
      icon: newBadgeIcon.value,
      condition_type: newBadgeConditionType.value,
      condition_value: newBadgeConditionValue.value,
      level: newBadgeLevel.value,
    })
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
  newProblemId.value = null
  newProblemOrder.value = 0
  newProblemRequired.value = true
  newProblemScore.value = 0
  newProblemHint.value = ""
  showAddProblemModal.value = true
}

function openAddBadgeModal() {
  newBadgeName.value = ""
  newBadgeDescription.value = ""
  newBadgeIcon.value = ""
  newBadgeConditionType.value = "all_problems"
  newBadgeConditionValue.value = 1
  newBadgeLevel.value = 1
  showAddBadgeModal.value = true
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
      <n-flex align="center">
        <n-button @click="router.back()" secondary>
          ← 返回
        </n-button>
        <h2 class="title">{{ problemSet.title }}</h2>
      </n-flex>
      <n-button
        type="primary"
        @click="router.push({ name: 'admin problemset edit', params: { problemSetId } })"
      >
        编辑题单
      </n-button>
    </n-flex>

    <n-card title="题单信息" style="margin-bottom: 16px">
      <n-flex vertical gap="medium">
        <n-flex>
          <span style="width: 100px; font-weight: bold">描述：</span>
          <span>{{ problemSet.description }}</span>
        </n-flex>
        <n-flex>
          <span style="width: 100px; font-weight: bold">创建者：</span>
          <span>{{ problemSet.created_by.username }}</span>
        </n-flex>
        <n-flex>
          <span style="width: 100px; font-weight: bold">难度：</span>
          <n-tag :type="problemSet.difficulty === 'Easy' ? 'success' : problemSet.difficulty === 'Medium' ? 'warning' : 'error'">
            {{ problemSet.difficulty === 'Easy' ? '简单' : problemSet.difficulty === 'Medium' ? '中等' : '困难' }}
          </n-tag>
        </n-flex>
        <n-flex>
          <span style="width: 100px; font-weight: bold">状态：</span>
          <n-tag :type="problemSet.status === 'active' ? 'success' : problemSet.status === 'archived' ? 'default' : 'info'">
            {{ problemSet.status === 'active' ? '活跃' : problemSet.status === 'archived' ? '已归档' : '草稿' }}
          </n-tag>
        </n-flex>
        <n-flex>
          <span style="width: 100px; font-weight: bold">公开：</span>
          <span>{{ problemSet.is_public ? '是' : '否' }}</span>
        </n-flex>
        <n-flex>
          <span style="width: 100px; font-weight: bold">可见：</span>
          <span>{{ problemSet.visible ? '是' : '否' }}</span>
        </n-flex>
        <n-flex>
          <span style="width: 100px; font-weight: bold">题目数量：</span>
          <span>{{ problemSet.problems_count }}</span>
        </n-flex>
        <n-flex>
          <span style="width: 100px; font-weight: bold">创建时间：</span>
          <span>{{ parseTime(problemSet.create_time, "YYYY-MM-DD HH:mm:ss") }}</span>
        </n-flex>
      </n-flex>
    </n-card>

    <n-tabs type="line">
      <n-tab-pane name="problems" tab="题目管理">
        <n-flex justify="space-between" align="center" style="margin-bottom: 16px">
          <h3>题目列表</h3>
          <n-button type="primary" @click="openAddProblemModal">
            添加题目
          </n-button>
        </n-flex>
        <n-data-table
          :columns="[
            { title: '题目ID', key: 'problem.id', width: 80 },
            { title: '题目标题', key: 'problem.title', minWidth: 200 },
            { title: '顺序', key: 'order', width: 80 },
            { title: '必做', key: 'is_required', width: 80, render: (row) => row.is_required ? '是' : '否' },
            { title: '分数', key: 'score', width: 80 },
            { title: '提示', key: 'hint', minWidth: 200 },
            {
              title: '操作',
              key: 'actions',
              width: 120,
              render: (row) => h(NButton, {
                size: 'small',
                type: 'error',
                secondary: true,
                onClick: () => handleRemoveProblem(row.problem.id)
              }, { default: () => '移除' })
            }
          ]"
          :data="problems"
        />
      </n-tab-pane>

      <n-tab-pane name="badges" tab="奖章管理">
        <n-flex justify="space-between" align="center" style="margin-bottom: 16px">
          <h3>奖章列表</h3>
          <n-button type="primary" @click="openAddBadgeModal">
            添加奖章
          </n-button>
        </n-flex>
        <n-data-table
          :columns="[
            { title: '名称', key: 'name', minWidth: 150 },
            { title: '描述', key: 'description', minWidth: 200 },
            { title: '图标', key: 'icon', width: 100 },
            { title: '条件类型', key: 'condition_type', width: 120 },
            { title: '条件值', key: 'condition_value', width: 100 },
            { title: '等级', key: 'level', width: 80 },
            {
              title: '操作',
              key: 'actions',
              width: 120,
              render: (row) => h(NButton, {
                size: 'small',
                type: 'error',
                secondary: true,
                onClick: () => handleDeleteBadge(row.id)
              }, { default: () => '删除' })
            }
          ]"
          :data="badges"
        />
      </n-tab-pane>

      <n-tab-pane name="progress" tab="进度管理">
        <n-flex justify="space-between" align="center" style="margin-bottom: 16px">
          <h3>用户进度</h3>
        </n-flex>
        <n-data-table
          :columns="progressColumns"
          :data="progress"
        />
      </n-tab-pane>
    </n-tabs>

    <!-- 添加题目模态框 -->
    <n-modal v-model:show="showAddProblemModal" preset="card" title="添加题目" style="width: 500px">
      <n-form>
        <n-form-item label="题目ID" required>
          <n-input-number v-model:value="newProblemId" placeholder="请输入题目ID" />
        </n-form-item>
        <n-form-item label="顺序">
          <n-input-number v-model:value="newProblemOrder" placeholder="题目在题单中的顺序" />
        </n-form-item>
        <n-form-item label="是否必做">
          <n-switch v-model:value="newProblemRequired" />
        </n-form-item>
        <n-form-item label="分数">
          <n-input-number v-model:value="newProblemScore" placeholder="题目分数" />
        </n-form-item>
        <n-form-item label="提示">
          <n-input v-model:value="newProblemHint" type="textarea" placeholder="题目提示" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-flex justify="end">
          <n-button @click="showAddProblemModal = false">取消</n-button>
          <n-button type="primary" @click="handleAddProblem">确认</n-button>
        </n-flex>
      </template>
    </n-modal>

    <!-- 添加奖章模态框 -->
    <n-modal v-model:show="showAddBadgeModal" preset="card" title="添加奖章" style="width: 500px">
      <n-form>
        <n-form-item label="奖章名称" required>
          <n-input v-model:value="newBadgeName" placeholder="请输入奖章名称" />
        </n-form-item>
        <n-form-item label="描述">
          <n-input v-model:value="newBadgeDescription" type="textarea" placeholder="奖章描述" />
        </n-form-item>
        <n-form-item label="图标">
          <n-input v-model:value="newBadgeIcon" placeholder="奖章图标" />
        </n-form-item>
        <n-form-item label="条件类型">
          <n-select v-model:value="newBadgeConditionType" :options="conditionTypeOptions" />
        </n-form-item>
        <n-form-item label="条件值">
          <n-input-number v-model:value="newBadgeConditionValue" placeholder="条件值" />
        </n-form-item>
        <n-form-item label="等级">
          <n-input-number v-model:value="newBadgeLevel" placeholder="奖章等级" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-flex justify="end">
          <n-button @click="showAddBadgeModal = false">取消</n-button>
          <n-button type="primary" @click="handleAddBadge">确认</n-button>
        </n-flex>
      </template>
    </n-modal>
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

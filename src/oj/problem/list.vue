<script setup lang="ts">
import { useUserStore } from "../../shared/stores/user"
import { filterEmptyValue, getTagColor } from "../../utils/functions"
import { isDesktop } from "../../utils/breakpoints"
import { getProblemList, getProblemTagList, getRandomProblemID } from "../api"

const difficultyOptions = [
  { label: "全部", value: "" },
  { label: "简单", value: "Low" },
  { label: "中等", value: "Mid" },
  { label: "困难", value: "High" },
]

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const problems = ref([])
const total = ref(0)

const { data: tags } = getProblemTagList()

const query = reactive({
  keyword: (route.query.keyword as string) || "",
  difficulty: route.query.difficulty || "",
  tag: route.query.tag || "",
  page: parseInt(<string>route.query.page) || 1,
  limit: parseInt(<string>route.query.limit) || 10,
})

async function listProblems() {
  query.keyword = (route.query.keyword as string) || ""
  query.difficulty = route.query.difficulty || ""
  query.tag = route.query.tag || ""
  query.page = parseInt(<string>route.query.page) || 1
  query.limit = parseInt(<string>route.query.limit) || 10

  if (query.page < 1) query.page = 1
  const offset = (query.page - 1) * query.limit
  const res = await getProblemList(offset, query.limit, {
    keyword: query.keyword,
    tag: query.tag,
    difficulty: query.difficulty,
  })
  total.value = res.total
  problems.value = res.results
}

function routePush() {
  router.push({
    path: "/",
    query: filterEmptyValue(query),
  })
}

function search() {
  query.page = 1
  routePush()
}

function clear() {
  query.keyword = ""
  query.tag = ""
  query.difficulty = ""
  query.page = 1
  routePush()
}

async function getRandom() {
  const res = await getRandomProblemID()
  router.push("/problem/" + res.data)
}

function goProblem(row: any) {
  router.push("/problem/" + row._id)
}

watch(() => query.page, routePush)

watch(
  () => query.tag || query.difficulty || query.limit,
  () => {
    query.page = 1
    routePush()
  }
)

watch(
  () => route.path === "/" && route.query,
  (newVal) => {
    if (newVal) listProblems()
  }
)

// TODO: 这里会在登录时候执行两次，有BUG
watch(() => userStore.isFinished && userStore.isAuthed, listProblems)

onMounted(listProblems)
</script>

<template>
  <el-form inline>
    <el-form-item label="难度">
      <el-select v-model="query.difficulty">
        <el-option
          v-for="item in difficultyOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="标签">
      <el-select v-model="query.tag" clearable>
        <el-option
          v-for="item in tags"
          :key="item.id"
          :label="item.name"
          :value="item.name"
        >
        </el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="搜索">
      <el-input
        v-model="query.keyword"
        placeholder="输入编号或标题后回车"
        clearable
        @change="search"
      />
    </el-form-item>
    <el-form-item>
      <el-button type="" @click="clear">重置</el-button>
      <el-button type="" @click="getRandom">随机一题</el-button>
    </el-form-item>
  </el-form>
  <el-table class="pointer" :data="problems" stripe @row-click="goProblem">
    <el-table-column v-if="isDesktop" label="状态" :width="80">
      <template #default="scope">
        <el-icon
          v-if="scope.row.status === 'done'"
          color="var(--el-color-success)"
          ><i-ep-select
        /></el-icon>
        <el-icon
          v-if="scope.row.status === 'tried'"
          color="var(--el-color-error)"
          ><i-ep-semi-select
        /></el-icon>
      </template>
    </el-table-column>
    <el-table-column prop="_id" label="编号" :width="isDesktop ? 100 : 60" />
    <el-table-column prop="title" label="标题" />
    <el-table-column label="难度" width="100">
      <template #default="scope">
        <el-tag
          disable-transitions
          :type="(getTagColor(scope.row.difficulty) as any)"
        >
          {{ scope.row.difficulty }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column v-if="isDesktop" label="标签" :width="200">
      <template #default="scope">
        <el-space>
          <el-tag
            disable-transitions
            v-for="tag in scope.row.tags"
            :key="tag"
            type="info"
            >{{ tag }}</el-tag
          >
        </el-space>
      </template>
    </el-table-column>
    <el-table-column
      v-if="isDesktop"
      prop="submission"
      label="提交数"
      width="100"
    />
    <el-table-column v-if="isDesktop" prop="rate" label="通过率" width="100" />
  </el-table>
  <el-pagination
    class="right margin"
    :layout="isDesktop ? 'prev,pager,next,sizes' : 'prev,next,sizes'"
    background
    :total="total"
    :page-sizes="[10, 20, 30]"
    :pager-count="5"
    v-model:page-size="query.limit"
    v-model:current-page="query.page"
  />
</template>

<style scoped>
.margin {
  margin-top: 24px;
}
.right {
  float: right;
}
.pointer {
  cursor: pointer;
}

.panel {
  width: 400px;
  padding: 0 4px;
}

.panel-tag {
  margin: 4px;
}
</style>

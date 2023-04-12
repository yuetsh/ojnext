<script setup lang="ts">
import { useUserStore } from "~/shared/store/user"
import { filterEmptyValue, getTagColor } from "utils/functions"
import { ProblemFiltered } from "utils/types"
import { getProblemList, getRandomProblemID } from "oj/api"
import Pagination from "~/shared/Pagination.vue"
import { NSpace, NTag } from "naive-ui"
import ProblemStatus from "./components/ProblemStatus.vue"
import { getProblemTagList } from "~/shared/api"

interface Tag {
  id: number
  name: string
  checked: boolean
}

interface Query {
  keyword: string
  difficulty: string
  tag: string
  page: number
  limit: number
}

const difficultyOptions = [
  { label: "全部", value: "" },
  { label: "简单", value: "Low" },
  { label: "中等", value: "Mid" },
  { label: "困难", value: "High" },
]

const router = useRouter()
const route = useRoute()

const userStore = useUserStore()
const problems = ref<ProblemFiltered[]>([])
const total = ref(0)
const tags = ref<Tag[]>([])

const query = reactive<Query>({
  keyword: <string>route.query.keyword ?? "",
  difficulty: <string>route.query.difficulty ?? "",
  tag: <string>route.query.tag ?? "",
  page: parseInt(<string>route.query.page) || 1,
  limit: parseInt(<string>route.query.limit) || 10,
})

async function listProblems() {
  query.keyword = <string>route.query.keyword ?? ""
  query.difficulty = <string>route.query.difficulty ?? ""
  query.tag = <string>route.query.tag ?? ""
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

async function listTags() {
  const res = await getProblemTagList()
  tags.value = res.data.map((r: Omit<Tag, "checked">) => ({
    ...r,
    checked: false,
  }))
}

function routerPush() {
  router.push({
    path: route.path,
    query: filterEmptyValue(query),
  })
}

function search(value: string) {
  query.keyword = value
}

function chooseTag(tag: Tag) {
  query.tag = tag.checked ? "" : tag.name
  tags.value = tags.value.map((t) => {
    if (t.id === tag.id) {
      t.checked = !t.checked
    } else {
      t.checked = false
    }
    return t
  })
}

function clear() {
  query.keyword = ""
  query.tag = ""
  query.difficulty = ""
}

async function getRandom() {
  const res = await getRandomProblemID()
  router.push("/problem/" + res.data)
}

watch(() => query.page, routerPush)

watch(
  () => [query.tag, query.difficulty, query.limit, query.keyword],
  () => {
    query.page = 1
    routerPush()
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

onMounted(() => {
  listProblems()
  listTags()
})

const columns: DataTableColumn<ProblemFiltered>[] = [
  {
    title: "状态",
    key: "status",
    width: 60,
    render: (row) => h(ProblemStatus, { status: row.status }),
  },
  { title: "编号", key: "_id", width: 100 },
  { title: "题目", key: "title", minWidth: 200 },
  {
    title: "难度",
    key: "difficulty",
    width: 100,
    render: (row) =>
      h(NTag, { type: getTagColor(row.difficulty) }, () => row.difficulty),
  },
  {
    title: "标签",
    key: "tags",
    width: 260,
    render: (row) =>
      h(NSpace, () => row.tags.map((t) => h(NTag, { key: t }, () => t))),
  },
  { title: "提交数", key: "submission", width: 100 },
  { title: "通过率", key: "rate", width: 100 },
]

function rowProps(row: ProblemFiltered) {
  return {
    style: "cursor: pointer",
    onClick() {
      router.push("/problem/" + row._id)
    },
  }
}
</script>

<template>
  <n-space vertical size="large">
    <n-space>
      <n-form :show-feedback="false" inline label-placement="left">
        <n-form-item label="难度">
          <n-select
            class="select"
            v-model:value="query.difficulty"
            :options="difficultyOptions"
          />
        </n-form-item>
        <n-form-item label="搜索">
          <n-input clearable @change="search" />
        </n-form-item>
      </n-form>
      <n-form :show-feedback="false" inline label-placement="left">
        <n-form-item>
          <n-space>
            <n-button @click="search(query.keyword)">搜索</n-button>
            <n-button @click="clear">重置</n-button>
            <n-button @click="getRandom">随机一题</n-button>
          </n-space>
        </n-form-item>
      </n-form>
    </n-space>
    <n-space>
      <div class="tagTitle">标签</div>
      <n-button
        @click="chooseTag(tag)"
        v-for="tag in tags"
        :key="tag.id"
        size="small"
        secondary
        :type="tag.checked ? 'success' : 'default'"
      >
        {{ tag.name }}
      </n-button>
    </n-space>
    <n-data-table
      striped
      :data="problems"
      :columns="columns"
      :row-props="rowProps"
    />
  </n-space>
  <Pagination
    :total="total"
    v-model:limit="query.limit"
    v-model:page="query.page"
  />
</template>

<style scoped>
.tagTitle {
  line-height: 28px;
}

.select {
  width: 120px;
}
</style>

<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { NSpace, NTag } from "naive-ui"
import { getProblemList } from "oj/api"
import { filterEmptyValue, getTagColor } from "utils/functions"
import { ProblemFiltered } from "utils/types"
import { getProblemTagList } from "~/shared/api"
import Hitokoto from "~/shared/components/Hitokoto.vue"
import Pagination from "~/shared/components/Pagination.vue"
import { isDesktop } from "~/shared/composables/breakpoints"
import { useUserStore } from "~/shared/store/user"
import { renderTableTitle } from "~/utils/renders"
import ProblemStatus from "./components/ProblemStatus.vue"

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
const [showTag, toggleShowTag] = useToggle(isDesktop.value)

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
    checked: query.tag === r.name,
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

// async function getRandom() {
//   const res = await getRandomProblemID()
//   router.push("/problem/" + res.data)
// }

watch(() => query.page, routerPush)
watch(
  () => [query.tag, query.difficulty, query.limit],
  () => {
    query.page = 1
    routerPush()
  },
)
watchDebounced(
  () => query.keyword,
  () => {
    query.page = 1
    routerPush()
  },
  { debounce: 500, maxWait: 1000 },
)
watch(
  () => query.tag,
  () => {
    tags.value = tags.value.map((r: Omit<Tag, "checked">) => ({
      ...r,
      checked: query.tag === r.name,
    }))
  },
)
watch(
  () => route.path === "/" && route.query,
  (newVal) => {
    if (newVal) listProblems()
  },
)

// TODO: 这里会在登录时候执行两次，有BUG
watch(() => userStore.isFinished && userStore.isAuthed, listProblems)

onMounted(() => {
  listProblems()
  listTags()
})

const baseColumns: DataTableColumn<ProblemFiltered>[] = [
  {
    title: renderTableTitle("状态", "streamline-emojis:high-voltage"),
    key: "status",
    width: 80,
    align: "center",
    render: (row) => h(ProblemStatus, { status: row.status }),
  },
  {
    title: renderTableTitle("编号", "streamline-emojis:game-dice"),
    key: "_id",
    width: 100,
  },
  {
    title: renderTableTitle("题目", "streamline-emojis:watermelon-2"),
    key: "title",
    minWidth: 200,
  },
  {
    title: renderTableTitle("难度", "streamline-emojis:lady-beetle"),
    key: "difficulty",
    width: 100,
    render: (row) =>
      h(NTag, { type: getTagColor(row.difficulty) }, () => row.difficulty),
  },
  {
    title: renderTableTitle("标签", "streamline-emojis:paperclip"),
    key: "tags",
    width: 260,
    render: (row) =>
      h(NSpace, () => row.tags.map((t) => h(NTag, { key: t }, () => t))),
  },
  {
    title: renderTableTitle("出题者", "streamline-emojis:man-raising-hand-2"),
    key: "author",
    width: 130,
  },
  {
    title: renderTableTitle("提交数", "streamline-emojis:writing-hand-2"),
    key: "submission",
    align: "center",
    width: 100,
  },
  {
    title: renderTableTitle("通过率", "streamline-emojis:victory-hand-2"),
    key: "rate",
    width: 100,
    align: "center",
  },
]

const columns = computed(() =>
  userStore.isAuthed
    ? baseColumns
    : baseColumns.filter((c: any) => c.key !== "status"),
)

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
  <n-flex vertical size="large">
    <n-flex justify="space-between">
      <n-flex>
        <div>
          <n-form :show-feedback="false" inline label-placement="left">
            <n-form-item label="题目难度">
              <n-select
                style="width: 120px"
                v-model:value="query.difficulty"
                :options="difficultyOptions"
              />
            </n-form-item>
            <n-form-item>
              <n-input
                clearable
                style="width: 200px"
                v-model:value="query.keyword"
                placeholder="题号或者标题"
              />
            </n-form-item>
          </n-form>
        </div>
        <div>
          <n-form :show-feedback="false" inline label-placement="left">
            <n-form-item>
              <n-flex align="center">
                <n-button @click="search(query.keyword)">搜索</n-button>
                <n-button @click="clear" quaternary>重置</n-button>
                <!-- <n-button @click="getRandom" quaternary>试试手气</n-button> -->
              </n-flex>
            </n-form-item>
          </n-form>
        </div>
        <n-button @click="toggleShowTag()" quaternary icon-placement="right">
          <template #icon>
            <Icon v-if="showTag" icon="ph:caret-down"></Icon>
            <Icon v-else icon="ph:caret-up"></Icon>
          </template>
          标签
        </n-button>
      </n-flex>
      <Hitokoto v-if="isDesktop" />
    </n-flex>
    <n-collapse-transition :show="showTag">
      <n-flex>
        <n-tag
          v-for="tag in tags"
          :closable="tag.checked"
          @close="chooseTag(tag)"
          @click="chooseTag(tag)"
          :key="tag.id"
          :type="tag.checked ? 'success' : 'default'"
        >
          {{ tag.name }}
        </n-tag>
      </n-flex>
    </n-collapse-transition>
    <n-data-table
      :bordered="false"
      :data="problems"
      :columns="columns"
      :row-props="rowProps"
    />
  </n-flex>
  <Pagination
    :total="total"
    v-model:limit="query.limit"
    v-model:page="query.page"
  />
</template>

<style scoped></style>

<script setup lang="ts">
import { NSwitch } from "naive-ui"
import { parseTime } from "~/utils/functions"
import { Tutorial } from "~/utils/types"
import { getTutorialList, setTutorialVisibility } from "../api"
import Actions from "./components/Actions.vue"

const tutorials = ref<{ [key: string]: Tutorial[] }>({
  python: [],
  c: []
})
const message = useMessage()
const activeTab = ref('python')

const columns: DataTableColumn<Tutorial>[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "标题", key: "title", minWidth: 300 },
  {
    title: "创建时间",
    key: "created_at",
    width: 180,
    render: (row) => parseTime(row.created_at!, "YYYY-MM-DD HH:mm:ss"),
  },
  {
    title: "顺序",
    key: "order",
  },
  {
    title: "作者",
    key: "created_by",
    render: (row) => row.created_by?.username,
    width: 80,
  },
  {
    title: "可见",
    key: "is_public",
    render: (row) =>
      h(NSwitch, {
        value: row.is_public,
        size: "small",
        rubberBand: false,
        onUpdateValue: () => toggleVisible(row),
      }),
  },
  {
    title: "操作",
    key: "actions",
    width: 140,
    render: (row) =>
      h(Actions, { tutorialID: row.id, onDeleted: listTutorials }),
  },
]

async function toggleVisible(tutorial: Tutorial) {
  tutorial.is_public = !tutorial.is_public
  try {
    await setTutorialVisibility(tutorial.id, tutorial.is_public)
    message.success("更新成功")
  } catch (err: any) {
    message.error(err.data)
    tutorial.is_public = !tutorial.is_public
  }
}

async function listTutorials() {
  tutorials.value = await getTutorialList()
}

onMounted(listTutorials)
</script>

<template>
  <n-flex align="center" class="titleWrapper">
    <h2 class="title">教程列表</h2>
    <n-button
      type="primary"
      @click="$router.push({ name: 'admin tutorial create' })"
    >
      新建
    </n-button>
  </n-flex>
  <n-tabs v-model:value="activeTab" type="line" animated>
    <n-tab-pane name="python" tab="Python">
      <n-data-table striped :columns="columns" :data="tutorials.python" />
    </n-tab-pane>
    <n-tab-pane name="c" tab="C 语言">
      <n-data-table striped :columns="columns" :data="tutorials.c" />
    </n-tab-pane>
  </n-tabs>
</template>

<style scoped>
.titleWrapper {
  margin-bottom: 16px;
}

.title {
  margin: 0;
}
</style>

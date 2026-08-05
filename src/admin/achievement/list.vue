<script setup lang="ts">
import { NButton, NFlex } from "naive-ui"
import {
  deleteAchievement,
  getAdminAchievements,
  type AdminAchievement,
} from "admin/api"
import AchievementIcon from "shared/components/AchievementIcon.vue"
import AchievementModal from "./components/AchievementModal.vue"

const message = useMessage()
const dialog = useDialog()

const list = ref<AdminAchievement[]>([])
const loading = ref(false)
const showModal = ref(false)
const editing = ref<AdminAchievement | null>(null)

const RARITY_LABEL: Record<string, string> = {
  bronze: "青铜",
  silver: "白银",
  gold: "黄金",
  platinum: "白金",
}

async function load() {
  loading.value = true
  try {
    const res = await getAdminAchievements()
    list.value = res.data
  } finally {
    loading.value = false
  }
}

function create() {
  editing.value = null
  showModal.value = true
}

function edit(row: AdminAchievement) {
  editing.value = row
  showModal.value = true
}

function remove(row: AdminAchievement) {
  dialog.warning({
    title: "删除成就",
    content: `确定删除「${row.name}」？已解锁记录会一并删除。`,
    positiveText: "删除",
    negativeText: "取消",
    onPositiveClick: async () => {
      await deleteAchievement(row.id)
      message.success("已删除")
      load()
    },
  })
}

const columns: DataTableColumn<AdminAchievement>[] = [
  {
    title: "图标",
    key: "icon",
    width: 60,
    render: (row) => h(AchievementIcon, { icon: row.icon, size: 24 }),
  },
  { title: "名称", key: "name" },
  {
    title: "稀有度",
    key: "rarity",
    width: 90,
    render: (row) => RARITY_LABEL[row.rarity] ?? row.rarity,
  },
  { title: "指标", key: "metric_name" },
  {
    title: "条件",
    key: "threshold",
    width: 110,
    render: (row) => `${row.operator === "gte" ? "≥" : "≤"} ${row.threshold}`,
  },
  {
    title: "隐藏",
    key: "hidden",
    width: 70,
    render: (row) => (row.hidden ? "是" : "—"),
  },
  {
    title: "上架",
    key: "visible",
    width: 70,
    render: (row) => (row.visible ? "是" : "否"),
  },
  { title: "已解锁人数", key: "unlock_count", width: 110 },
  {
    title: "操作",
    key: "actions",
    width: 130,
    render: (row) =>
      h(NFlex, { size: 8 }, () => [
        h(
          NButton,
          { text: true, type: "primary", onClick: () => edit(row) },
          () => "编辑",
        ),
        h(
          NButton,
          { text: true, type: "error", onClick: () => remove(row) },
          () => "删除",
        ),
      ]),
  },
]

onMounted(load)
</script>

<template>
  <n-card title="成就管理">
    <template #header-extra>
      <n-button type="primary" @click="create">新建成就</n-button>
    </template>

    <n-alert type="info" style="margin-bottom: 12px">
      「已解锁人数」是唯一的仪表盘：配置一周后仍为
      0，多半是阈值配错了而不是太难。
    </n-alert>

    <n-data-table
      :loading="loading"
      :data="list"
      :columns="columns"
      :row-key="(row: AdminAchievement) => row.id"
    />

    <AchievementModal
      v-model:show="showModal"
      :editing="editing"
      @saved="load"
    />
  </n-card>
</template>

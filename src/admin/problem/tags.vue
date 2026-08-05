<script setup lang="ts">
import { NButton, NFlex, NInput } from "naive-ui"
import type { AdminTag } from "utils/types"
import { deleteTag, getTagAdminList, renameTag } from "../api"

const message = useMessage()
const dialog = useDialog()

const tags = ref<AdminTag[]>([])
const keyword = ref("")
const editingId = ref<number | null>(null)
const editingName = ref("")

const columns: DataTableColumn<AdminTag>[] = [
  { title: "ID", key: "id", width: 80 },
  {
    title: "标签名",
    key: "name",
    minWidth: 200,
    render: (row) =>
      editingId.value === row.id
        ? h(NInput, {
            value: editingName.value,
            autofocus: true,
            size: "small",
            style: "max-width: 240px",
            onUpdateValue: (v: string) => (editingName.value = v),
            onKeyup: (e: KeyboardEvent) => {
              if (e.key === "Enter") saveTag(row)
              if (e.key === "Escape") cancelEdit()
            },
          })
        : row.name,
  },
  { title: "题目数", key: "problem_count", width: 100 },
  {
    title: "选项",
    key: "actions",
    width: 200,
    render: (row) =>
      h(NFlex, { size: 8 }, () =>
        editingId.value === row.id
          ? [
              h(
                NButton,
                { size: "small", type: "primary", onClick: () => saveTag(row) },
                () => "保存",
              ),
              h(NButton, { size: "small", onClick: cancelEdit }, () => "取消"),
            ]
          : [
              h(
                NButton,
                { size: "small", onClick: () => startEdit(row) },
                () => "重命名",
              ),
              h(
                NButton,
                {
                  size: "small",
                  type: "error",
                  onClick: () => confirmDelete(row),
                },
                () => "删除",
              ),
            ],
      ),
  },
]

async function listTags() {
  const res = await getTagAdminList(keyword.value)
  tags.value = res.data
}

function startEdit(tag: AdminTag) {
  editingId.value = tag.id
  editingName.value = tag.name
}

function cancelEdit() {
  editingId.value = null
  editingName.value = ""
}

async function saveTag(tag: AdminTag) {
  const name = editingName.value.trim()
  if (!name) {
    message.error("标签名不能为空")
    return
  }
  if (name === tag.name) {
    cancelEdit()
    return
  }
  const res = await renameTag(tag.id, name)
  if (res.data.merged) {
    message.success(
      `已合并到「${res.data.name}」，影响 ${res.data.affected_count} 道题`,
    )
  } else {
    message.success("已重命名")
  }
  cancelEdit()
  listTags()
}

function confirmDelete(tag: AdminTag) {
  dialog.warning({
    title: "删除标签",
    content: `确定删除标签「${tag.name}」吗？当前有 ${tag.problem_count} 道题在使用它，删除后这些题目会失去该标签。`,
    positiveText: "删除",
    negativeText: "取消",
    onPositiveClick: async () => {
      await deleteTag(tag.id)
      message.success("已删除")
      listTags()
    },
  })
}

onMounted(listTags)

watchDebounced(keyword, listTags, { debounce: 500, maxWait: 1000 })
</script>

<template>
  <n-flex class="titleWrapper" justify="space-between">
    <n-flex align="center">
      <h2 class="title">标签管理</h2>
      <n-button @click="$router.push({ name: 'admin problem list' })">
        返回题目列表
      </n-button>
    </n-flex>
    <n-input
      v-model:value="keyword"
      style="width: 200px"
      placeholder="搜索标签"
      clearable
    />
  </n-flex>
  <n-data-table striped :columns="columns" :data="tags" />
</template>

<style scoped>
.titleWrapper {
  margin-bottom: 16px;
}

.title {
  margin: 0;
}
</style>

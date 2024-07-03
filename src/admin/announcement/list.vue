<script setup lang="ts">
import Pagination from "~/shared/components/Pagination.vue"
import Actions from "./components/Actions.vue"
import { Announcement } from "~/utils/types"
import { editAnnouncement, getAnnouncementList } from "../api"
import { parseTime } from "~/utils/functions"
import { NSwitch } from "naive-ui"

const total = ref(0)
const query = reactive({
  limit: 10,
  page: 1,
})
const announcements = ref<Announcement[]>([])

const columns: DataTableColumn<Announcement>[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "标题", key: "title", minWidth: 300 },
  { title: "标签", key: "tag", width: 80 },
  {
    title: "置顶",
    key: "top",
    render: (row) => (row.top ? "置顶" : ""),
    width: 80,
  },
  {
    title: "创建时间",
    key: "create_time",
    width: 180,
    render: (row) => parseTime(row.create_time, "YYYY-MM-DD HH:mm:ss"),
  },
  {
    title: "上次更新时间",
    key: "last_update_time",
    width: 180,
    render: (row) => parseTime(row.last_update_time, "YYYY-MM-DD HH:mm:ss"),
  },
  {
    title: "作者",
    key: "created_by",
    render: (row) => row.created_by.username,
    width: 80,
  },
  {
    title: "可见",
    key: "visible",
    render: (row) =>
      h(NSwitch, {
        value: row.visible,
        size: "small",
        rubberBand: false,
        onUpdateValue: () => toggleVisible(row),
      }),
  },
  {
    title: "选项",
    key: "actions",
    width: 140,
    render: (row) =>
      h(Actions, { announcementID: row.id, onDeleted: listAnnouncements }),
  },
]

async function toggleVisible(announcement: Announcement) {
  announcement.visible = !announcement.visible
  editAnnouncement({
    id: announcement.id,
    title: announcement.title,
    tag: announcement.tag,
    content: announcement.content,
    visible: announcement.visible,
    top: announcement.top,
  })
}

async function listAnnouncements() {
  const offset = (query.page - 1) * query.limit
  const res = await getAnnouncementList(offset, query.limit)
  announcements.value = res.data.results
  total.value = res.data.total
}

onMounted(listAnnouncements)
watch(query, listAnnouncements, { deep: true })
</script>

<template>
  <h2 class="title">网站公告</h2>
  <n-data-table striped :columns="columns" :data="announcements" />
  <Pagination
    :total="total"
    v-model:limit="query.limit"
    v-model:page="query.page"
  />
</template>

<style scoped>
.title {
  margin: 0 0 16px;
}
</style>

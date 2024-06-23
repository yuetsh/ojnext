<script lang="ts" setup>
import { getAnnouncementList, getAnnouncement } from "~/oj/api"
import Pagination from "~/shared/components/Pagination.vue"
import { parseTime } from "~/utils/functions"
import { Announcement } from "~/utils/types"
import { isDesktop } from "~/shared/composables/breakpoints"
import { NTag } from "naive-ui"
import TitleWithTag from "./components/TitleWithTag.vue"

const total = ref(0)
const content = ref("")
const title = ref("")
const [show, toggleShow] = useToggle(false)
const query = reactive({
  limit: 10,
  page: 1,
})
const columns: DataTableColumn<Announcement>[] = [
  {
    key: "title",
    title: "公告标题",
    render: (row) => h(TitleWithTag, { title: row.title, top: row.top }),
    minWidth: 300,
  },
  {
    key: "tag",
    title: "标签",
    render: (row) => h(NTag, row.tag || "公告"),
  },
  {
    key: "create_time",
    title: "发布时间",
    render: (row) => parseTime(row.create_time),
    width: 180,
  },
  {
    key: "last_update_time",
    title: "更新时间",
    render: (row) => parseTime(row.last_update_time),
    width: 180,
  },
  {
    key: "username",
    title: "发布人",
    render: (row) => row.created_by.username,
    width: 120,
  },
]
function rowProps(row: Announcement) {
  return {
    style: "cursor: pointer",
    onclick: () => showContent(row),
  }
}

async function showContent(announcement: Announcement) {
  const res = await getAnnouncement(announcement.id)
  toggleShow(true)
  title.value = announcement.title
  content.value = res.data.content
}
const announcements = ref<Announcement[]>([])

async function listAnnouncements() {
  const offset = (query.page - 1) * query.limit
  const res = await getAnnouncementList(offset, query.limit)
  total.value = res.data.total
  announcements.value = res.data.results
}

onMounted(listAnnouncements)
watch(query, listAnnouncements, { deep: true })
</script>
<template>
  <n-data-table
    striped
    :data="announcements"
    :columns="columns"
    :row-props="rowProps"
  />
  <Pagination
    v-model:limit="query.limit"
    v-model:page="query.page"
    :total="total"
  />
  <n-modal
    v-model:show="show"
    preset="card"
    :style="{ maxWidth: isDesktop && '70vw', maxHeight: '80vh' }"
    :content-style="{ overflow: 'auto' }"
    :title="title"
  >
    <div v-html="content"></div>
  </n-modal>
</template>

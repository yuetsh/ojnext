<script lang="ts" setup>
import { getAnnouncementList } from "~/oj/api"
import Pagination from "~/shared/components/Pagination.vue"
import { parseTime } from "~/utils/functions"
import { Announcement } from "~/utils/types"
import { isDesktop } from "~/shared/composables/breakpoints"

const total = ref(0)
const content = ref("")
const title = ref("")
const [show, toggleShow] = useToggle(false)
const query = reactive({
  limit: 10,
  page: 1,
})
const columns: DataTableColumn<Announcement>[] = [
  { key: "title", title: "公告标题", minWidth: 300 },
  {
    key: "create_time",
    title: "发布时间",
    render: (row) => parseTime(row.create_time),
    width: 160,
  },
  {
    key: "username",
    title: "发布人",
    render: (row) => row.created_by.username,
    width: 100,
  },
]
function rowProps(row: Announcement) {
  return {
    style: "cursor: pointer",
    onclick: () => showContent(row),
  }
}

function showContent(announcement: Announcement) {
  toggleShow(true)
  title.value = announcement.title
  content.value = announcement.content
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

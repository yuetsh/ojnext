<script lang="ts" setup>
import TextEditor from "shared/components/TextEditor.vue"
import { AnnouncementEdit } from "utils/types"
import { createAnnouncement, editAnnouncement, getAnnouncement } from "../api"

interface Props {
  announcementID?: string
}

const route = useRoute()
const router = useRouter()
const message = useMessage()
const props = defineProps<Props>()
const [ready, toggleReady] = useToggle()

const announcement = reactive<AnnouncementEdit>({
  id: 0,
  title: "",
  tag: "公告",
  content: "",
  visible: false,
  top: false,
})

const tags: SelectOption[] = [
  { label: "公告", value: "公告" },
  { label: "更新", value: "更新" },
]

async function init() {
  if (!props.announcementID) {
    toggleReady(true)
    return
  }
  const id = parseInt(route.params.announcementID as string)
  const res = await getAnnouncement(id)
  toggleReady(true)
  announcement.id = id
  announcement.title = res.data.title
  announcement.content = res.data.content
  announcement.visible = res.data.visible
  announcement.tag = res.data.tag
  announcement.top = res.data.top
}

async function submit() {
  if (announcement.content === "<p><br></p>") {
    announcement.content = ""
  }
  if (!announcement.title || !announcement.content) {
    message.error("标题和正文必填")
    return
  }
  const api = {
    "admin announcement create": createAnnouncement,
    "admin announcement edit": editAnnouncement,
  }[route.name as string]
  try {
    await api!(announcement)
    if (route.name === "admin announcement create") {
      message.success("成功新建公告 💐")
    } else {
      message.success("修改已保存")
    }
    router.push({ name: "admin announcement list" })
  } catch (err: any) {
    message.error(err.data)
  }
}

onMounted(init)
</script>
<template>
  <h2 class="title">
    {{ route.name === "admin announcement create" ? "新建公告" : "编辑公告" }}
  </h2>
  <n-form inline>
    <n-form-item label="标题">
      <n-input class="contestTitle" v-model:value="announcement.title" />
    </n-form-item>
    <n-form-item label="标签">
      <n-select
        class="select"
        v-model:value="announcement.tag"
        :options="tags"
      />
    </n-form-item>
    <n-form-item label="可见">
      <n-switch v-model:value="announcement.visible" />
    </n-form-item>
    <n-form-item label="置顶">
      <n-switch v-model:value="announcement.top" />
    </n-form-item>
  </n-form>
  <TextEditor
    v-if="ready"
    title="正文"
    v-model:value="announcement.content"
    :min-height="200"
  />
  <n-flex style="margin-bottom: 100px" justify="end">
    <n-button type="primary" @click="submit">保存</n-button>
  </n-flex>
</template>
<style scoped>
.title {
  margin-top: 0;
}

.select {
  width: 100px;
}

.contestTitle {
  width: 400px;
}
</style>

<script setup lang="ts">
import { formatISO } from "date-fns"
import TextEditor from "~/shared/components/TextEditor.vue"
import { BlankContest } from "~/utils/types"
import { createContest, editContest, getContest } from "../api"

interface Props {
  contestID?: string
}

const after10mins = Date.now() + 1000 * 600
const after70mins = after10mins + 1000 * 3600

const route = useRoute()
const router = useRouter()
const message = useMessage()
const props = defineProps<Props>()

const [ready, toggleReady] = useToggle()
const startTime = ref(after10mins)
const endTime = ref(after70mins)

const contest = reactive<BlankContest & { id: number }>({
  id: 0,
  title: "",
  description: "",
  start_time: formatISO(after10mins),
  end_time: formatISO(after70mins),
  rule_type: "ACM",
  password: "",
  real_time_rank: true,
  visible: true,
  allowed_ip_ranges: [],
})

watch([startTime, endTime], (values) => {
  contest.start_time = formatISO(values[0])
  contest.end_time = formatISO(values[1])
})

async function getContestDetail() {
  if (!props.contestID) {
    toggleReady(true)
    return
  }
  const { data } = await getContest(props.contestID)
  toggleReady(true)
  contest.id = data.id
  contest.title = data.title
  contest.description = data.description
  contest.start_time = data.start_time
  contest.end_time = data.end_time
  contest.rule_type = "ACM"
  contest.password = data.password
  contest.real_time_rank = true
  contest.visible = data.visible
  contest.allowed_ip_ranges = []

  // 显示
  startTime.value = Date.parse(data.start_time)
  endTime.value = Date.parse(data.end_time)
}

async function submit() {
  if (contest.description === '<p><br></p>') {
    contest.description = ""
  }
  const api = {
    "admin contest create": createContest,
    "admin contest edit": editContest,
  }[<string>route.name]
  try {
    await api!(contest)
    if (route.name === "admin contest create") {
      message.success("成功新建比赛 💐")
    } else {
      message.success("修改已保存")
    }
    router.push({ name: "admin contest list" })
  } catch (err: any) {
    message.error(err.data)
  }
}

onMounted(getContestDetail)
</script>

<template>
  <h2 class="title">
    {{ route.name === "admin contest create" ? "新建比赛" : "编辑比赛" }}
  </h2>
  <n-form inline>
    <n-form-item label="标题">
      <n-input class="contestTitle" v-model:value="contest.title" />
    </n-form-item>
    <n-form-item label="开始">
      <n-date-picker v-model:value="startTime" type="datetime" />
    </n-form-item>
    <n-form-item label="结束">
      <n-date-picker v-model:value="endTime" type="datetime" />
    </n-form-item>
    <n-form-item label="密码">
      <n-input v-model:value="contest.password" />
    </n-form-item>
    <n-form-item label="可见">
      <n-switch v-model:value="contest.visible" />
    </n-form-item>
  </n-form>
  <TextEditor
    v-if="ready"
    title="描述"
    v-model:value="contest.description"
    :min-height="200"
  />
  <n-button type="primary" @click="submit">保存</n-button>
</template>

<style scoped>
.title {
  margin-top: 0;
}

.contestTitle {
  width: 400px;
}
</style>

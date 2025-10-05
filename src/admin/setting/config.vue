<script setup lang="ts">
import { NButton, NTag } from "naive-ui"
import { parseTime } from "utils/functions"
import { Server } from "utils/types"
import {
  deleteJudgeServer,
  editWebsite,
  getJudgeServer,
  getWebsite,
  listInvalidTestcases,
  pruneInvalidTestcases,
} from "../api"

interface Testcase {
  id: string
  create_time: string
}

const message = useMessage()

const testcaseColumns: DataTableColumn<Testcase>[] = [
  { title: "测试用例 ID", key: "id" },
  {
    title: "选项",
    key: "delete",
    render: (row) =>
      h(
        NButton,
        { size: "small", onClick: () => deleteTestcase(row.id) },
        () => "删除",
      ),
  },
]

const statusMap: {
  [key in "normal" | "abnormal"]: { color: "primary" | "error"; label: string }
} = {
  normal: { color: "primary", label: "正常" },
  abnormal: { color: "error", label: "异常" },
}

const serverColumns: DataTableColumn<Server>[] = [
  {
    title: "状态",
    key: "status",
    width: 80,
    render: (row) =>
      h(
        NTag,
        { type: statusMap[row.status].color, size: "small" },
        () => statusMap[row.status].label,
      ),
  },
  {
    title: "选项",
    key: "options",
    width: 80,
    render: (row) =>
      h(
        NButton,
        {
          type: "primary",
          size: "small",
          disabled: row.status === "normal",
          onClick: () => delJudgeServer(row.hostname),
        },
        () => "删除",
      ),
  },
  { title: "主机", key: "hostname", width: 140 },
  {
    title: "内存占用",
    key: "memory_usage",
    render: (row) => row.memory_usage + "%",
    width: 100,
  },
  { title: "IP", key: "ip", width: 140 },
  { title: "判题机版本", key: "judger_version", width: 100 },
  { title: "服务器 URL", key: "service_url", width: 200 },
  {
    title: "上一次心跳",
    key: "last_heartbeat",
    render: (row) => parseTime(row.last_heartbeat, "YYYY-MM-DD HH:mm:ss"),
    width: 120,
  },
  {
    title: "创建时间",
    key: "create_time",
    render: (row) => parseTime(row.create_time, "YYYY-MM-DD HH:mm:ss"),
    width: 120,
  },
]

const testcases = ref<Testcase[]>([])
const token = ref("")
const servers = ref<Server[]>([])
const abnormalServers = computed(() =>
  servers.value.filter((item) => item.status === "abnormal"),
)

const websiteConfig = reactive({
  website_base_url: import.meta.env.PUBLIC_OJ_URL,
  website_name: "判题狗",
  website_name_shortcut: "判题狗",
  website_footer: "所有权归属于徐越，感谢青岛大学开源 OJ 系统，感谢开源社区",
  allow_register: true,
  submission_list_show_all: true,
  class_list: [],
})

async function getWebsiteConfig() {
  const res = await getWebsite()
  websiteConfig.website_base_url = res.data.website_base_url
  websiteConfig.website_name = res.data.website_name
  websiteConfig.website_name_shortcut = res.data.website_name_shortcut
  websiteConfig.website_footer = res.data.website_footer
  websiteConfig.allow_register = res.data.allow_register
  websiteConfig.submission_list_show_all = res.data.submission_list_show_all
  websiteConfig.class_list = res.data.class_list
}

async function saveWebsiteConfig() {
  await editWebsite(websiteConfig)
  message.success("网站配置保存成功")
  getWebsiteConfig()
}

async function deleteTestcase(id?: string) {
  await pruneInvalidTestcases(id)
  message.success("删除成功")
  getTestcases()
}

async function getTestcases() {
  const res = await listInvalidTestcases()
  testcases.value = res.data
}

async function getJudgeServerData() {
  const res = await getJudgeServer()
  token.value = res.data.token
  servers.value = res.data.servers
}

async function delJudgeServer(hostname: string) {
  await deleteJudgeServer(hostname)
  message.success("删除成功")
}

async function deleteAbnormalServers() {
  const dels = abnormalServers.value.map((item) =>
    deleteJudgeServer(item.hostname),
  )
  await Promise.all(dels)
  message.success("删除成功")
  getJudgeServerData()
}

onMounted(() => {
  getWebsiteConfig()
  getTestcases()
  getJudgeServerData()
})
</script>

<template>
  <n-card class="box">
    <template #header>
      <n-flex align="center">
        网站设置
        <n-button type="primary" size="small" @click="saveWebsiteConfig">
          保存
        </n-button>
      </n-flex>
    </template>
    <n-form inline label-placement="left">
      <n-form-item label="网站 URL">
        <n-input class="url" v-model:value="websiteConfig.website_base_url" />
      </n-form-item>
      <n-form-item label="网站名">
        <n-input v-model:value="websiteConfig.website_name" />
      </n-form-item>
      <n-form-item label="网站简称">
        <n-input v-model:value="websiteConfig.website_name_shortcut" />
      </n-form-item>
    </n-form>
    <n-form label-placement="left">
      <n-form-item label="班级列表">
        <n-dynamic-tags v-model:value="websiteConfig.class_list" />
      </n-form-item>
    </n-form>
    <n-flex align="center">
      <n-flex align="center">
        <span>是否允许注册</span>
        <n-switch v-model:value="websiteConfig.allow_register" />
      </n-flex>
      <n-flex align="center">
        <span>显示所有提交</span>
        <n-switch v-model:value="websiteConfig.submission_list_show_all" />
      </n-flex>
    </n-flex>
  </n-card>
  <n-card class="box">
    <template #header>
      <n-flex align="center">
        判题服务器
        <n-button
          v-if="abnormalServers.length"
          size="small"
          type="warning"
          @click="deleteAbnormalServers"
        >
          删除无效服务器
        </n-button>
      </n-flex>
    </template>
    <div class="box">
      接口凭证 <n-tag size="small">{{ token }}</n-tag>
    </div>
    <n-data-table
      :single-line="false"
      striped
      :columns="serverColumns"
      :data="servers"
    />
  </n-card>
  <n-card class="box" v-if="testcases.length">
    <template #header>
      <n-flex align="center">
        无效的测试用例
        <n-button size="small" type="warning" @click="() => deleteTestcase()">
          全部删除
        </n-button>
      </n-flex>
    </template>
    <n-data-table
      striped
      class="table"
      :columns="testcaseColumns"
      :data="testcases"
    />
  </n-card>
</template>

<style scoped>
.url {
  width: 200px;
}

.box {
  margin-bottom: 16px;
}

.table {
  width: 40%;
}
</style>

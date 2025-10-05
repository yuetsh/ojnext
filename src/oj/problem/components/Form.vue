<script setup lang="ts">
import { copyToClipboard } from "~/utils/functions"
import { code, input, output } from "oj/composables/code"
import { problem } from "oj/composables/problem"
import { LANGUAGE_SHOW_VALUE, SOURCES, STORAGE_KEY } from "utils/constants"
import { isDesktop, isMobile } from "~/shared/composables/breakpoints"
import { useUserStore } from "~/shared/store/user"
import { createTestSubmission } from "~/utils/judge"
import storage from "~/utils/storage"
import { LANGUAGE } from "~/utils/types"
import Submit from "./Submit.vue"
import StatisticsPanel from "~/shared/components/StatisticsPanel.vue"
import IconButton from "~/shared/components/IconButton.vue"

interface Props {
  storageKey: string
  withTest?: boolean
  otherUserInfo?: { name: string; isSuperAdmin: boolean }
  isConnected?: boolean // WebSocket 实际的连接状态（已建立/未建立）
  hadConnection?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  withTest: false,
  isConnected: false,
  hadConnection: false,
})

const emit = defineEmits<{
  changeLanguage: [v: LANGUAGE]
  toggleSync: [v: boolean]
}>()

const message = useMessage()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const syncEnabled = ref(false) // 用户点击按钮后的意图状态（想要开启/关闭）
const statisticPanel = ref(false)

// 计算属性
const isContestMode = computed(() => route.name === "contest problem")
const buttonSize = computed(() => (isDesktop.value ? "medium" : "small"))
const showSyncFeature = computed(
  () => isDesktop.value && userStore.isAuthed && !isContestMode.value,
)

const menu = computed<DropdownOption[]>(() => [
  { label: "去自测猫", key: "goTestCat", show: isMobile.value },
  { label: "复制代码", key: "copy" },
  { label: "重置代码", key: "reset" },
])

const languageOptions: DropdownOption[] = problem.value!.languages.map(
  (it) => ({
    label: () =>
      h("div", { style: "display: flex; align-items: center;" }, [
        h("img", {
          src: `/${it}.svg`,
          style: { width: "16px", height: "16px", marginRight: "8px" },
        }),
        LANGUAGE_SHOW_VALUE[it],
      ]),
    value: it,
  }),
)

// 代码操作相关
const copy = async () => {
  const success = await copyToClipboard(code.value)
  message[success ? "success" : "error"](`代码复制${success ? "成功" : "失败"}`)
}

const reset = () => {
  code.value = problem.value!.template[code.language] || SOURCES[code.language]
  storage.remove(props.storageKey)
  message.success("代码重置成功")
}

const changeLanguage = (v: LANGUAGE) => {
  storage.set(STORAGE_KEY.LANGUAGE, v)
  emit("changeLanguage", v)
}

const runCode = async () => {
  const res = await createTestSubmission(code, input.value)
  output.value = res.output
}

// 导航相关
const goTestCat = () => {
  window.open(import.meta.env.PUBLIC_CODE_URL, "_blank")
}

const goSubmissions = () => {
  const name = route.params.contestID ? "contest submissions" : "submissions"
  router.push({ name, query: { problem: problem.value!._id } })
}

const goEdit = () => {
  const url = problem.value!.contest
    ? `/admin/contest/${problem.value!.contest}/problem/edit/${problem.value!.id}`
    : `/admin/problem/edit/${problem.value!.id}`
  window.open(router.resolve(url).href, "_blank")
}

// 菜单处理
const handleMenuSelect = (key: string) => {
  const actions: Record<string, () => void> = {
    reset,
    copy,
    goTestCat,
  }
  actions[key]?.()
}

// 协同编辑相关
const toggleSync = () => {
  syncEnabled.value = !syncEnabled.value
  emit("toggleSync", syncEnabled.value)
}

defineExpose({
  resetSyncStatus: () => {
    syncEnabled.value = false
  },
})
</script>

<template>
  <n-flex align="center">
    <!-- 语言选择器 -->
    <n-select
      v-model:value="code.language"
      class="language"
      :size="buttonSize"
      :options="languageOptions"
      @update:value="changeLanguage"
    />

    <template v-if="withTest">
      <n-button @click="reset">重置代码</n-button>
      <n-button type="primary" secondary @click="runCode">运行代码</n-button>
    </template>

    <n-flex v-else align="center">
      <Submit />

      <n-button
        v-if="!userStore.isSuperAdmin && userStore.showSubmissions"
        :size="buttonSize"
        @click="goSubmissions"
      >
        提交信息
      </n-button>

      <n-button
        v-if="userStore.isSuperAdmin"
        :size="buttonSize"
        @click="statisticPanel = true"
      >
        {{ isDesktop ? "统计信息" : "统计" }}
      </n-button>

      <n-button v-if="isDesktop" @click="goTestCat">自测猫</n-button>

      <n-dropdown size="large" :options="menu" @select="handleMenuSelect">
        <n-button :size="buttonSize">操作</n-button>
      </n-dropdown>

      <IconButton
        v-if="isDesktop && userStore.isSuperAdmin"
        icon="streamline-ultimate-color:file-code-edit"
        tip="编辑题目"
        @click="goEdit"
      />

      <!-- 协同编辑功能（仅在非比赛模式） -->
      <template v-if="showSyncFeature">
        <IconButton
          :icon="
            syncEnabled
              ? 'streamline-stickies-color:earpod-connected'
              : 'streamline-stickies-color:earpod-connected-duo'
          "
          :tip="syncEnabled ? '断开同步' : '打开同步'"
          :type="syncEnabled ? 'info' : 'default'"
          @click="toggleSync"
        />

        <!-- 同步状态标签 -->
        <template v-if="props.isConnected">
          <n-tag v-if="otherUserInfo" type="info">
            与 {{ otherUserInfo.name }} 同步中
          </n-tag>
          <n-tag
            v-if="userStore.isSuperAdmin && !otherUserInfo && hadConnection"
            type="warning"
          >
            学生已退出，可以关闭同步
          </n-tag>
        </template>
      </template>
    </n-flex>
  </n-flex>

  <n-modal
    v-if="userStore.isSuperAdmin"
    v-model:show="statisticPanel"
    preset="card"
    title="提交记录的统计"
    :style="{ maxWidth: isDesktop && '70vw', maxHeight: '80vh' }"
    :content-style="{ overflow: 'auto' }"
  >
    <StatisticsPanel :problem="problem!._id" username="" />
  </n-modal>
</template>

<style scoped>
.language {
  width: 120px;
}
</style>

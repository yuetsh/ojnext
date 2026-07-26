<script setup lang="ts">
import { storeToRefs } from "pinia"
import { copyToClipboard, utoa } from "utils/functions"
import { useCodeStore } from "oj/store/code"
import { useProblemStore } from "oj/store/problem"
import { injectSyncStatus } from "oj/composables/syncStatus"
import { SYNC_MESSAGES } from "shared/composables/sync"
import {
  ICON_SET,
  LANGUAGE_FORMAT_VALUE,
  LANGUAGE_SHOW_VALUE,
  SOURCES,
  STORAGE_KEY,
} from "utils/constants"
import { useBreakpoints } from "shared/composables/breakpoints"
import { useUserStore } from "shared/store/user"
import storage from "utils/storage"
import type { LANGUAGE } from "utils/types"
import StatisticsPanel from "shared/components/StatisticsPanel.vue"
import { Icon } from "@iconify/vue"
import { NFlex } from "naive-ui"
import SubmitCode from "./SubmitCode.vue"

const SubmitFlowchart = defineAsyncComponent(
  () => import("./SubmitFlowchart.vue"),
)

interface Props {
  storageKey: string
  isConnected?: boolean // WebSocket 实际的连接状态（已建立/未建立）
}

const { storageKey, isConnected = false } = defineProps<Props>()

// 注入同步状态
const syncStatus = injectSyncStatus()

const emit = defineEmits<{
  changeLanguage: [v: LANGUAGE]
  toggleSync: [v: boolean]
}>()

const message = useMessage()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const codeStore = useCodeStore()
const problemStore = useProblemStore()
const { problem, languages } = storeToRefs(problemStore)

const { isDesktop } = useBreakpoints()

const syncEnabled = ref(false) // 用户点击按钮后的意图状态（想要开启/关闭）
const statisticPanel = ref(false)

// 计算属性
const isContestMode = computed(() => route.name === "contest problem")
const buttonSize = computed(() => (isDesktop.value ? "medium" : "small"))
const showSyncFeature = computed(
  () =>
    isDesktop.value &&
    userStore.isAuthed &&
    codeStore.code.language !== "Flowchart" &&
    !isContestMode.value,
)

const showGoSubmissionButton = computed(() => {
  if (isContestMode.value) return true
  else if (userStore.isAdminRole) return true
  else if (userStore.showSubmissions) return true
  else return false
})

const menuOptions = computed<DropdownOption[]>(() => {
  const options: DropdownOption[] = []
  // 移动端额外收纳桌面端常驻的两项
  if (!isDesktop.value) {
    if (showGoSubmissionButton.value) {
      options.push({
        label: "提交信息",
        key: "submissions",
      })
    }
    if (userStore.isTeacherOrAbove) {
      options.push({
        label: "统计信息",
        key: "statistics",
      })
    }
  }
  if (codeStore.code.language !== "Flowchart") {
    if (codeStore.code.language !== "SQL") {
      options.push({
        label: "去自测猫",
        key: "testcat",
      })
    }
    options.push({
      label: "复制代码",
      key: "copy",
    })
    options.push({
      label: "重置代码",
      key: "reset",
    })
  }
  if (isDesktop.value && userStore.isSuperAdmin) {
    options.push({
      label: "编辑题目",
      key: "edit",
    })
  }
  return options
})

const handleMenuSelect = (key: string) => {
  switch (key) {
    case "submissions":
      goSubmissions()
      break
    case "statistics":
      statisticPanel.value = true
      break
    case "testcat":
      goTestCat()
      break
    case "copy":
      copy()
      break
    case "reset":
      reset()
      break
    case "edit":
      goEdit()
      break
  }
}

const languageOptions: DropdownOption[] = languages.value.map((it) => ({
  label: () =>
    h(NFlex, { align: "center" }, () => [
      h(Icon, {
        icon: ICON_SET[it],
        width: 16,
      }),
      LANGUAGE_SHOW_VALUE[it],
    ]),
  value: it,
}))

const copy = async () => {
  const success = await copyToClipboard(codeStore.code.value)
  message[success ? "success" : "error"](`代码复制${success ? "成功" : "失败"}`)
}

const reset = () => {
  codeStore.setCode(
    problem.value!.template[codeStore.code.language] ||
      SOURCES[codeStore.code.language],
  )
  storage.remove(storageKey)
  message.success("代码重置成功")
}

const changeLanguage = (v: LANGUAGE) => {
  storage.set(STORAGE_KEY.LANGUAGE, v)
  emit("changeLanguage", v)
}

const goTestCat = () => {
  const lang = LANGUAGE_FORMAT_VALUE[codeStore.code.language]
  const data = {
    lang,
    code: codeStore.code.value,
    input: problemStore.problem?.samples[0].input,
  }
  const base64 = utoa(JSON.stringify(data))
  const url = `${import.meta.env.PUBLIC_CODE_URL}?share=${encodeURIComponent(base64)}`
  window.open(url, "_blank")
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

const toggleSync = () => {
  syncEnabled.value = !syncEnabled.value
  emit("toggleSync", syncEnabled.value)
}

defineExpose({
  resetSyncStatus: () => {
    syncEnabled.value = false
  },
})

onMounted(() => {
  if (!languages.value.includes(codeStore.code.language)) {
    // 回退到题目支持的第一种语言（如 SQL 题只有 "SQL"，硬编码 Python3 会被后端拒绝）
    codeStore.code.language = languages.value[0] ?? "Python3"
  }
})
</script>

<template>
  <n-flex align="center">
    <n-select
      v-model:value="codeStore.code.language"
      style="width: 120px"
      :size="buttonSize"
      :options="languageOptions"
      @update:value="changeLanguage"
    />

    <SubmitFlowchart v-if="codeStore.code.language === 'Flowchart'" />

    <SubmitCode v-else />

    <n-button
      v-if="isDesktop && showGoSubmissionButton"
      :size="buttonSize"
      @click="goSubmissions"
    >
      提交信息
    </n-button>

    <n-button
      v-if="isDesktop && userStore.isTeacherOrAbove"
      :size="buttonSize"
      @click="statisticPanel = true"
    >
      统计信息
    </n-button>

    <!-- 自测猫 / 复制代码 / 重置代码 / 编辑题目 收进下拉菜单；移动端再加上提交信息 / 统计信息 -->
    <n-dropdown
      v-if="menuOptions.length"
      trigger="click"
      :options="menuOptions"
      @select="handleMenuSelect"
    >
      <n-button :size="buttonSize">更多操作</n-button>
    </n-dropdown>

    <template v-if="showSyncFeature">
      <n-button
        :size="buttonSize"
        :type="syncEnabled ? 'warning' : 'default'"
        @click="toggleSync"
      >
        {{ syncEnabled ? SYNC_MESSAGES.SYNC_ON : SYNC_MESSAGES.SYNC_OFF }}
      </n-button>

      <!-- 同步状态标签 -->
      <template v-if="isConnected">
        <n-tag v-if="syncStatus.otherUser.value" type="info">
          {{ SYNC_MESSAGES.SYNCING_WITH(syncStatus.otherUser.value.name) }}
        </n-tag>
        <n-tag
          v-if="
            userStore.isSuperAdmin &&
            !syncStatus.otherUser.value &&
            syncStatus.hadConnection.value
          "
          type="warning"
        >
          {{ SYNC_MESSAGES.STUDENT_LEFT(syncStatus.lastLeftUser.value?.name) }}
        </n-tag>
      </template>
    </template>
  </n-flex>

  <n-modal
    v-if="userStore.isTeacherOrAbove"
    v-model:show="statisticPanel"
    preset="card"
    title="提交记录的统计"
    :style="{ maxWidth: isDesktop && '800px', maxHeight: '80vh' }"
    :content-style="{ overflow: 'auto' }"
  >
    <StatisticsPanel :problem="problem!._id" username="" />
  </n-modal>
</template>

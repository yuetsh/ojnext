<script setup lang="ts">
import { storeToRefs } from "pinia"
import { copyToClipboard } from "utils/functions"
import { useCodeStore } from "oj/store/code"
import { useProblemStore } from "oj/store/problem"
import { injectSyncStatus } from "oj/composables/syncStatus"
import { SYNC_MESSAGES } from "shared/composables/sync"
import {
  ICON_SET,
  LANGUAGE_SHOW_VALUE,
  SOURCES,
  STORAGE_KEY,
} from "utils/constants"
import { useBreakpoints } from "shared/composables/breakpoints"
import { useUserStore } from "shared/store/user"
import storage from "utils/storage"
import { LANGUAGE } from "utils/types"
import StatisticsPanel from "shared/components/StatisticsPanel.vue"
import IconButton from "shared/components/IconButton.vue"
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

const props = withDefaults(defineProps<Props>(), {
  isConnected: false,
})

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

const { isMobile, isDesktop } = useBreakpoints()

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

const menu = computed<DropdownOption[]>(() => [
  { label: "去自测猫", key: "goTestCat", show: isMobile.value },
  { label: "复制代码", key: "copy" },
  { label: "重置代码", key: "reset" },
])

const languageOptions: DropdownOption[] = languages.value.map(
  (it) => ({
    label: () =>
      h(NFlex, { align: "center" }, () => [
        h(Icon, {
          icon: ICON_SET[it],
          width: 16,
        }),
        LANGUAGE_SHOW_VALUE[it],
      ]),
    value: it,
  }),
)

const copy = async () => {
  const success = await copyToClipboard(codeStore.code.value)
  message[success ? "success" : "error"](`代码复制${success ? "成功" : "失败"}`)
}

const reset = () => {
  codeStore.setCode(
    problem.value!.template[codeStore.code.language] ||
      SOURCES[codeStore.code.language],
  )
  storage.remove(props.storageKey)
  message.success("代码重置成功")
}

const changeLanguage = (v: LANGUAGE) => {
  storage.set(STORAGE_KEY.LANGUAGE, v)
  emit("changeLanguage", v)
}

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

const handleMenuSelect = (key: string) => {
  const actions: Record<string, () => void> = {
    reset,
    copy,
    goTestCat,
  }
  actions[key]?.()
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
    codeStore.code.language = "Python3"
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

    <n-button
      v-if="isDesktop && codeStore.code.language !== 'Flowchart'"
      @click="goTestCat"
      >自测猫</n-button
    >

    <n-dropdown
      v-if="codeStore.code.language !== 'Flowchart'"
      size="large"
      :options="menu"
      @select="handleMenuSelect"
    >
      <n-button :size="buttonSize">操作</n-button>
    </n-dropdown>

    <IconButton
      v-if="isDesktop && userStore.isSuperAdmin"
      icon="streamline-ultimate-color:file-code-edit"
      tip="编辑题目"
      @click="goEdit"
    />

    <template v-if="showSyncFeature">
      <IconButton
        :icon="
          syncEnabled
            ? 'streamline-ultimate-color:flash-off'
            : 'streamline-ultimate-color:monitor-flash'
        "
        :tip="syncEnabled ? SYNC_MESSAGES.SYNC_ON : SYNC_MESSAGES.SYNC_OFF"
        :type="syncEnabled ? 'warning' : 'default'"
        @click="toggleSync"
      />

      <!-- 同步状态标签 -->
      <template v-if="props.isConnected">
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

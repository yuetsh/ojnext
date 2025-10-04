<script setup lang="ts">
import copyText from "copy-text-to-clipboard"
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
  isSynced?: boolean
  hadConnection?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  withTest: false,
  isSynced: false,
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

const isSynced = ref(false)
const statisticPanel = ref(false)

const menu = computed<DropdownOption[]>(() => [
  { label: "去自测猫", key: "test", show: isMobile.value },
  { label: "复制代码", key: "copy" },
  { label: "重置代码", key: "reset" },
])

const languageOptions: DropdownOption[] = problem.value!.languages.map((it) => ({
  label: () =>
    h("div", { style: "display: flex; align-items: center;" }, [
      h("img", {
        src: `/${it}.svg`,
        style: { width: "16px", height: "16px", marginRight: "8px" },
      }),
      LANGUAGE_SHOW_VALUE[it],
    ]),
  value: it,
}))

const copy = () => {
  copyText(code.value)
  message.success("代码复制成功")
}

const reset = () => {
  code.value = problem.value!.template[code.language] || SOURCES[code.language]
  storage.remove(props.storageKey)
  message.success("代码重置成功")
}

const goSubmissions = () => {
  const name = route.params.contestID ? "contest submissions" : "submissions"
  router.push({ name, query: { problem: problem.value!._id } })
}

const goEdit = () => {
  const baseUrl = "/admin/problem/edit/" + problem.value!.id
  const url = problem.value!.contest
    ? `/admin/contest/${problem.value!.contest}/problem/edit/${problem.value!.id}`
    : baseUrl
  window.open(router.resolve(url).href, "_blank")
}

const test = async () => {
  const res = await createTestSubmission(code, input.value)
  output.value = res.output
}

const handleMenuSelect = (key: string) => {
  const actions: Record<string, () => void> = {
    reset,
    copy,
    test: () => window.open(import.meta.env.PUBLIC_CODE_URL, "_blank"),
  }
  actions[key]?.()
}

const changeLanguage = (v: LANGUAGE) => {
  storage.set(STORAGE_KEY.LANGUAGE, v)
  emit("changeLanguage", v)
}

const toggleSync = () => {
  isSynced.value = !isSynced.value
  emit("toggleSync", isSynced.value)
}

const gotoTestCat = () => {
  window.open(import.meta.env.PUBLIC_CODE_URL, "_blank")
}

defineExpose({
  resetSyncStatus: () => {
    isSynced.value = false
  },
})
</script>

<template>
  <n-flex align="center">
    <n-select
      v-model:value="code.language"
      class="language"
      :size="isDesktop ? 'medium' : 'small'"
      :options="languageOptions"
      @update:value="changeLanguage"
    />
    
    <template v-if="withTest">
      <n-button @click="reset">重置代码</n-button>
      <n-button type="primary" secondary @click="test">运行代码</n-button>
    </template>

    <n-flex v-else align="center">
      <Submit />
      
      <n-button
        v-if="!userStore.isSuperAdmin && userStore.showSubmissions"
        :size="isDesktop ? 'medium' : 'small'"
        @click="goSubmissions"
      >
        提交信息
      </n-button>
      
      <n-button
        v-if="userStore.isSuperAdmin"
        :size="isDesktop ? 'medium' : 'small'"
        @click="statisticPanel = true"
      >
        {{ isDesktop ? "统计信息" : "统计" }}
      </n-button>
      
      <n-button v-if="isDesktop" @click="gotoTestCat">自测猫</n-button>
      
      <n-dropdown size="large" :options="menu" @select="handleMenuSelect">
        <n-button :size="isDesktop ? 'medium' : 'small'">操作</n-button>
      </n-dropdown>
      
      <IconButton
        v-if="isDesktop && userStore.isSuperAdmin"
        icon="streamline-ultimate-color:file-code-edit"
        tip="编辑题目"
        @click="goEdit"
      />
      
      <IconButton
        v-if="isDesktop && userStore.isAuthed"
        :icon="
          isSynced
            ? 'streamline-stickies-color:earpod-connected'
            : 'streamline-stickies-color:earpod-connected-duo'
        "
        :tip="isSynced ? '断开同步' : '打开同步'"
        :type="isSynced ? 'info' : 'default'"
        @click="toggleSync"
      />
      
      <template v-if="props.isSynced">
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

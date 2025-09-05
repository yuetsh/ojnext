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

interface Props {
  storageKey: string
  withTest?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  withTest: false,
})

const message = useMessage()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const emit = defineEmits(["changeLanguage"])

function copy() {
  copyText(code.value)
  message.success("代码复制成功")
}

function reset() {
  code.value = problem.value!.template[code.language] || SOURCES[code.language]
  storage.remove(props.storageKey)
  message.success("代码重置成功")
}

function goSubmissions() {
  const name = !!route.params.contestID ? "contest submissions" : "submissions"
  router.push({ name, query: { problem: problem.value!._id } })
}

function goEdit() {
  let data = router.resolve("/admin/problem/edit/" + problem.value!.id)
  if (problem.value!.contest) {
    data = router.resolve(
      `/admin/contest/${problem.value!.contest}/problem/edit/${problem.value!.id}`,
    )
  }
  window.open(data.href, "_blank")
}

async function test() {
  const res = await createTestSubmission(code, input.value)
  output.value = res.output
}

const menu = computed<DropdownOption[]>(() => [
  { label: "提交信息", key: "submissions", show: isMobile.value },
  { label: "自测猫", key: "test", show: isMobile.value },
  { label: "复制代码", key: "copy" },
  { label: "重置代码", key: "reset" },
])

const options: DropdownOption[] = problem.value!.languages.map((it) => ({
  label: () => [
    h("img", {
      src: `/${it}.svg`,
      style: {
        width: "16px",
        height: "16px",
        marginRight: "8px",
        transform: "translateY(3px)",
      },
    }),
    LANGUAGE_SHOW_VALUE[it],
  ],
  value: it,
}))

async function select(key: string) {
  switch (key) {
    case "submissions":
      goSubmissions()
      break
    case "reset":
      reset()
      break
    case "copy":
      copy()
      break
    case "test":
      window.open(import.meta.env.PUBLIC_CODE_URL, "_blank")
      break
  }
}

function changeLanguage(v: LANGUAGE) {
  storage.set(STORAGE_KEY.LANGUAGE, v)
  emit("changeLanguage", v)
}

function gotoTestCat() {
  const url = import.meta.env.PUBLIC_CODE_URL
  window.open(url, "_blank")
}
</script>

<template>
  <n-flex align="center">
    <n-select
      class="language"
      v-model:value="code.language"
      @update:value="changeLanguage"
      :size="isDesktop ? 'medium' : 'small'"
      :options="options"
    />
    <n-button v-if="withTest" @click="reset">重置代码</n-button>
    <n-button v-if="withTest" type="primary" secondary @click="test">
      运行代码
    </n-button>
    <n-flex align="center" v-if="!withTest">
      <Submit />
      <n-button v-if="isDesktop" @click="gotoTestCat">自测猫</n-button>
      <n-button v-if="isDesktop" @click="goSubmissions">提交信息</n-button>
      <n-dropdown size="large" :options="menu" @select="select">
        <n-button :size="isDesktop ? 'medium' : 'small'">操作</n-button>
      </n-dropdown>
      <n-button
        v-if="isDesktop && userStore.isSuperAdmin"
        type="warning"
        @click="goEdit"
      >
        编辑
      </n-button>
    </n-flex>
  </n-flex>
</template>

<style scoped>
.language {
  width: 120px;
}
</style>

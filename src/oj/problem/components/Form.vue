<script setup lang="ts">
import copy from "copy-text-to-clipboard"
import { LANGUAGE_SHOW_VALUE, SOURCES } from "utils/constants"
import { code } from "oj/composables/code"
import { problem } from "oj/composables/problem"
import { isDesktop, isMobile } from "~/shared/composables/breakpoints"
import { useUserStore } from "~/shared/store/user"
import Submit from "./Submit.vue"
import TestCat from "./TestCat2.vue"
import storage from "~/utils/storage"
import { STORAGE_KEY } from "utils/constants"
import { LANGUAGE } from "~/utils/types"

const message = useMessage()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const emit = defineEmits(["changeLanguage"])

function reset() {
  code.value = problem.value!.template[code.language] || SOURCES[code.language]
  message.success("代码重置成功")
}

function goSubmissions() {
  const name = !!route.params.contestID ? "contest submissions" : "submissions"
  router.push({ name, query: { problem: problem.value!._id } })
}

function goEdit() {
  const data = router.resolve("/admin/problem/edit/" + problem.value!.id)
  window.open(data.href, "_blank")
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
      copy(code.value)
      message.success("代码复制成功")
      break
    case "test":
      window.open("https://code.xuyue.cc", "_blank")
      break
  }
}

function changeLanguage(v: LANGUAGE) {
  storage.set(STORAGE_KEY.LANGUAGE, v)
  emit("changeLanguage", v)
}
</script>

<template>
  <n-space align="center">
    <n-select
      class="language"
      v-model:value="code.language"
      @update:value="changeLanguage"
      :size="isDesktop ? 'medium' : 'small'"
      :options="options"
    />
    <Submit />
    <TestCat
      v-if="isDesktop"
      :lang="code.language"
      :input="problem?.samples[0].input"
    />
    <n-button v-if="isDesktop" @click="goSubmissions">提交信息</n-button>
    <n-dropdown :options="menu" @select="select">
      <n-button :size="isDesktop ? 'medium' : 'small'">操作</n-button>
    </n-dropdown>
    <n-button
      v-if="isDesktop && userStore.isSuperAdmin"
      type="warning"
      @click="goEdit"
    >
      编辑
    </n-button>
  </n-space>
</template>

<style scoped>
.language {
  width: 120px;
}
</style>

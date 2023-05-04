<script setup lang="ts">
import { LANGUAGE_SHOW_VALUE, SOURCES } from "utils/constants"
import { code } from "oj/composables/code"
import { problem } from "oj/composables/problem"
import { isDesktop, isMobile } from "~/shared/composables/breakpoints"
import { useUserStore } from "~/shared/store/user"
import Submit from "./Submit.vue"
import TestCat from "./TestCat.vue"
import storage from "~/utils/storage"
import { STORAGE_KEY } from "utils/constants"
import { LANGUAGE } from "~/utils/types"

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const emit = defineEmits(["changeLanguage"])

function reset() {
  code.value = problem.value!.template[code.language] || SOURCES[code.language]
}

function goSubmissions() {
  const name = !!route.params.contestID ? "contest submissions" : "submissions"
  router.push({ name, query: { problem: problem.value!._id } })
}

function goTestCat() {}

function goEdit() {
  const data = router.resolve("/admin/problem/edit/" + problem.value!.id)
  window.open(data.href, "_blank")
}

const menu: DropdownOption[] = [{ label: "提交信息", key: "submissions" }]

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

function select(key: string) {
  switch (key) {
    case "submissions":
      goSubmissions()
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
    <n-button :size="isDesktop ? 'medium' : 'small'" @click="reset">
      重置
    </n-button>
    <n-dropdown
      v-if="isMobile"
      trigger="click"
      :options="menu"
      @select="select"
    >
      <n-button :size="isDesktop ? 'medium' : 'small'">
        <template #icon>
          <n-icon>
            <i-ep-more-filled />
          </n-icon>
        </template>
      </n-button>
    </n-dropdown>
    <n-button v-if="isDesktop" @click="goSubmissions">提交信息</n-button>
    <TestCat />
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

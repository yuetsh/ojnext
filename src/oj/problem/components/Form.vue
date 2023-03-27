<script setup lang="ts">
import { DropdownOption } from "naive-ui"
import { LANGUAGE_SHOW_VALUE, SOURCES } from "utils/constants"
import { Problem } from "utils/types"
import { code } from "oj/composables/code"
import { isDesktop, isMobile } from "~/shared/composables/breakpoints"
import Submit from "./Submit.vue"
import { useUserStore } from "~/shared/store/user"

interface Props {
  problem: Problem
}

const props = defineProps<Props>()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

watch(() => code.language, reset)

function reset() {
  code.value = props.problem.template[code.language] || SOURCES[code.language]
}

function goSubmissions() {
  const name = !!route.params.contestID ? "contest submissions" : "submissions"
  router.push({ name, query: { problem: props.problem._id } })
}

function edit() {
  router.push("/admin/problem/edit/" + props.problem.id)
}

const menu: DropdownOption[] = [
  { label: "重置", key: "reset" },
  { label: "提交信息", key: "submissions" },
]

const options: DropdownOption[] = props.problem.languages.map((it) => ({
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
    case "reset":
      reset()
      break
    case "submissions":
      goSubmissions()
      break
  }
}
</script>

<template>
  <n-form inline label-placement="left">
    <n-form-item>
      <n-select
        class="language"
        v-model:value="code.language"
        :options="options"
      />
    </n-form-item>
    <n-form-item>
      <Submit />
    </n-form-item>
    <n-dropdown
      v-if="isMobile"
      trigger="click"
      :options="menu"
      @select="select"
    >
      <n-button>
        <template #icon>
          <n-icon>
            <i-ep-more-filled />
          </n-icon>
        </template>
      </n-button>
    </n-dropdown>
    <n-form-item v-if="isDesktop">
      <n-space>
        <n-button @click="reset">重置</n-button>
        <n-button @click="goSubmissions">提交信息</n-button>
        <n-button type="warning" v-if="userStore.isSuperAdmin" @click="edit">
          编辑
        </n-button>
      </n-space>
    </n-form-item>
  </n-form>
</template>

<style scoped>
.language {
  width: 140px;
}
</style>

<script lang="ts" setup>
import { SOURCES } from "utils/constants"
import { Problem } from "utils/types"
import Monaco from "~/shared/Monaco.vue"
import Submit from "./Submit.vue"
import { code } from "oj/composables/code"
import { isDesktop, isMobile } from "~/shared/composables/breakpoints"
import { DropdownOption } from "naive-ui"

interface Props {
  problem: Problem
}

const props = defineProps<Props>()
const route = useRoute()
const router = useRouter()

code.language = props.problem.languages[0] || "C"
code.value = props.problem.template[code.language] || SOURCES[code.language]

watch(() => code.language, reset)

function reset() {
  code.value = props.problem.template[code.language] || SOURCES[code.language]
}

function change(value: string) {
  code.value = value
}

function goSubmissions() {
  const name = !!route.params.contestID ? "contest submissions" : "submissions"
  router.push({ name, query: { problem: props.problem._id } })
}
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
    it,
  ],
  value: it,
}))

const menu: DropdownOption[] = [
  { label: "重置", key: "reset" },
  { label: "提交信息", key: "submissions" },
]

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
    <n-form-item :label="isDesktop ? '语言' : ''">
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
      </n-space>
    </n-form-item>
  </n-form>
  <Monaco
    class="editor"
    :language="code.language"
    :value="code.value"
    @change="change"
    height="calc(100vh - 200px)"
  />
</template>

<style scoped>
.language {
  width: 140px;
}
.editor {
  min-height: 200px;
}
</style>

<script lang="ts" setup>
import { code, input, output } from "oj/composables/code"
import { problem } from "oj/composables/problem"
import { SOURCES } from "utils/constants"
import CodeEditor from "shared/components/CodeEditor.vue"
import storage from "utils/storage"
import { createTestSubmission } from "utils/judge"
import { LANGUAGE_SHOW_VALUE } from "utils/constants"
import type { DropdownOption } from "naive-ui"
import { copyToClipboard } from "utils/functions"

const message = useMessage()
const route = useRoute()
const contestID = !!route.params.contestID ? route.params.contestID : null

const storageKey = computed(
  () =>
    `problem_${problem.value!._id}_contest_${contestID}_lang_${code.language}`,
)

onMounted(() => {
  if (storage.get(storageKey.value)) {
    code.value = storage.get(storageKey.value)
  } else {
    code.value =
      problem.value!.template[code.language] || SOURCES[code.language]
  }
})

function changeCode(v: string) {
  storage.set(storageKey.value, v)
}

function changeLanguage(v: string) {
  if (
    storage.get(storageKey.value) &&
    storageKey.value.split("_").pop() === v
  ) {
    code.value = storage.get(storageKey.value)
  } else {
    code.value =
      problem.value!.template[code.language] || SOURCES[code.language]
  }
}

const copy = async () => {
  const success = await copyToClipboard(code.value)
  message[success ? "success" : "error"](`代码复制${success ? "成功" : "失败"}`)
}

const reset = () => {
  code.value = problem.value!.template[code.language] || SOURCES[code.language]
  storage.remove(storageKey.value)
  message.success("代码重置成功")
}

const runCode = async () => {
  const res = await createTestSubmission(code, input.value)
  output.value = res.output
}

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
</script>

<template>
  <n-flex vertical style="height: calc(100vh - 92px)">
    <n-split direction="horizontal" :min="1 / 3" :max="4 / 5">
      <template #1>
        <n-flex vertical>
          <n-flex align="center">
            <n-select
              v-model:value="code.language"
              style="width: 120px"
              :options="languageOptions"
              @update:value="changeLanguage"
            />
            <n-button @click="copy">
              复制代码
            </n-button>
            <n-button @click="reset">重置代码</n-button>
            <n-button type="primary" secondary @click="runCode">
              运行代码
            </n-button>
          </n-flex>
          <CodeEditor
            v-model:value="code.value"
            @update:model-value="changeCode"
            :language="code.language"
          />
        </n-flex>
      </template>
      <template #2>
        <n-split
          direction="vertical"
          :default-size="1 / 3"
          :min="1 / 5"
          :max="3 / 5"
        >
          <template #1>
            <div class="title">输入框</div>
            <n-input
              v-model:value="input"
              type="textarea"
              :bordered="false"
              :resizable="false"
              class="box"
            />
          </template>
          <template #2>
            <div class="title">输出框</div>
            <n-input
              class="box output"
              v-model:value="output"
              placeholder=""
              type="textarea"
              :bordered="false"
              :resizable="false"
              readonly
            />
          </template>
        </n-split>
      </template>
    </n-split>
  </n-flex>
</template>

<style scoped>
.title {
  height: 40px;
  line-height: 40px;
  padding-left: 20px;
  font-size: 16px;
}

.box {
  padding-left: 10px;
  box-sizing: border-box;
  height: calc(100% - 40px);
  font-size: 20px;
}

.output {
  font-family: "Monaco";
}
</style>

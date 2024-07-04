<script lang="ts" setup>
import { SOURCES } from "utils/constants"
import { code, input, output } from "oj/composables/code"
import { isDesktop } from "~/shared/composables/breakpoints"
import { problem } from "oj/composables/problem"
import storage from "~/utils/storage"
import Form from "./Form.vue"
import CodeEditor from "~/shared/components/CodeEditor.vue"

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

const editorHeight = computed(() =>
  isDesktop.value ? "calc(100vh - 133px)" : "calc(100vh - 172px)",
)

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
</script>

<template>
  <n-flex vertical>
    <Form
      :storage-key="storageKey"
      @change-language="changeLanguage"
      with-test
    />
    <n-split direction="horizontal" :min="1 / 3" :max="4 / 5">
      <template #1>
        <CodeEditor
          v-model:value="code.value"
          @update:model-value="changeCode"
          :language="code.language"
          :height="editorHeight"
        />
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

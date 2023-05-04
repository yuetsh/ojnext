<script lang="ts" setup>
import CodeEditor from "~/shared/CodeEditor.vue"
import { LANGUAGE_SHOW_VALUE } from "~/utils/constants"
import { LANGUAGE } from "~/utils/types"
const code = ref("")
const input = ref("输入信息")
const output = ref("运行结果")
const language = ref<LANGUAGE>("C")

const languages: LANGUAGE[] = ["C", "Python3"]
const options: DropdownOption[] = languages.map((it) => ({
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
</script>
<template>
  <n-layout>
    <n-layout-header bordered class="header">
      <n-space align="center" justify="space-between" class="header">
        <div class="title">徐越的自测猫</div>
        <n-space>
          <n-select class="language" v-model="language" :options="options" />
          <n-button type="primary">运行 F5</n-button>
        </n-space>
      </n-space>
    </n-layout-header>
    <n-layout-content>
      <n-grid :cols="2" class="content">
        <n-gi>
          <CodeEditor v-model="code" :language="language" />
        </n-gi>
        <n-gi>
          <n-grid :cols="1" class="content">
            <n-gi>
              <CodeEditor v-model="input" :language="language" />
            </n-gi>
            <n-gi>
              <CodeEditor v-model="output" :language="language" readonly />
            </n-gi>
          </n-grid>
        </n-gi>
      </n-grid>
    </n-layout-content>
  </n-layout>
</template>
<style scoped>
.header {
  height: 60px;
  padding: 0 8px;
}
.title {
  font-size: 18px;
}

.content {
  height: calc(100vh - 60px);
}

.language {
  width: 120px;
}
</style>

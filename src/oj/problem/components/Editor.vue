<script lang="ts" setup>
import { SOURCES } from "utils/constants"
import { Problem } from "utils/types"
import Monaco from "~/shared/Monaco.vue"
import { code } from "oj/composables/code"

interface Props {
  problem: Problem
}

const props = defineProps<Props>()

code.language = props.problem.languages[0] || "C"
code.value = props.problem.template[code.language] || SOURCES[code.language]

watch(() => code.language, reset)

function reset() {
  code.value = props.problem.template[code.language] || SOURCES[code.language]
}

function change(value: string) {
  code.value = value
}
</script>

<template>
  <n-form inline label-placement="left">
    <n-form-item label="语言">
      <n-select
        class="language"
        v-model:value="code.language"
        :options="problem.languages.map((it) => ({ label: it, value: it }))"
      />
    </n-form-item>
    <n-form-item>
      <n-space>
        <n-button @click="reset">重置</n-button>
        <n-button @click="$router.push(`/submission?problem=${problem._id}`)">
          提交信息
        </n-button>
      </n-space>
    </n-form-item>
  </n-form>
  <Monaco
    class="editor"
    :language="code.language"
    :value="code.value"
    @change="change"
    height="calc(100vh - 594px)"
  />
</template>

<style scoped>
.language {
  width: 120px;
}
.editor {
  min-height: 200px;
}
</style>

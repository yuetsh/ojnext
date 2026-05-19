<script setup lang="ts">
import { downloadZip } from "client-zip"
import type { LANGUAGE, Testcase } from "utils/types"
import { createTestSubmission } from "utils/judge"
import { uploadTestcases } from "../../api"

interface FileEntry {
  id: number
  in: string
  out: string
  error: boolean
}

interface Props {
  answers: { language: LANGUAGE; code: string }[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  uploaded: [testCaseId: string, testCaseScore: Testcase[]]
}>()

const message = useMessage()

let nextId = 0
const files = ref<FileEntry[]>(
  Array.from({ length: 5 }, () => ({ id: nextId++, in: "", out: "", error: false })),
)

const selectedLanguage = ref<LANGUAGE>("Python3")

const availableLanguages = computed(() =>
  props.answers
    .filter((a) => a.code.trim())
    .map((a) => ({ label: a.language, value: a.language })),
)

const hasAnswerCode = computed(() => availableLanguages.value.length > 0)

// 当可用语言列表变化时，确保 selectedLanguage 始终指向一个有效值
watch(
  availableLanguages,
  (langs) => {
    if (langs.length && !langs.find((l) => l.value === selectedLanguage.value)) {
      selectedLanguage.value = langs[0].value
    }
  },
  { immediate: true },
)

const isRunning = ref(false)
const isUploading = ref(false)

const hasAnyInput = computed(() => files.value.some((f) => f.in.trim()))

const canUpload = computed(
  () =>
    !isRunning.value &&
    hasAnyInput.value &&
    files.value.filter((f) => f.in.trim()).every((f) => f.out && !f.error),
)

function reset() {
  files.value = Array.from({ length: 5 }, () => ({ id: nextId++, in: "", out: "", error: false }))
}

function add(n: number) {
  files.value.push(...Array.from({ length: n }, () => ({ id: nextId++, in: "", out: "", error: false })))
}

function remove(index: number) {
  files.value.splice(index, 1)
}

async function run() {
  const answer = props.answers.find((a) => a.language === selectedLanguage.value)
  if (!answer?.code.trim()) return

  // 过滤空行，去重（按输入内容）
  const seen = new Set<string>()
  files.value = files.value.filter((f) => {
    if (!f.in.trim()) return false
    if (seen.has(f.in)) return false
    seen.add(f.in)
    return true
  })

  // 清空旧输出
  files.value = files.value.map((f) => ({ ...f, out: "", error: false }))

  isRunning.value = true
  await Promise.all(
    files.value.map(async (_, i) => {
      try {
        const result = await createTestSubmission(
          { language: selectedLanguage.value, value: answer.code },
          files.value[i].in,
        )
        files.value[i] = { ...files.value[i], out: result.output, error: result.status !== 3 }
      } catch {
        files.value[i] = { ...files.value[i], out: "", error: true }
      }
    }),
  )
  isRunning.value = false
}

async function upload() {
  isUploading.value = true
  try {
    const now = new Date()
    const data = files.value
      .filter((f) => f.in.trim() && f.out && !f.error)
      .flatMap((f, i) => [
        { name: `${i + 1}.in`, input: f.in, lastModified: now },
        { name: `${i + 1}.out`, input: f.out, lastModified: now },
      ])

    const blob = await downloadZip(data).blob()
    const file = new File([blob], "testcase.zip", { type: "application/zip" })

    const res = await uploadTestcases(file)
    const testcases: Testcase[] = res.data.info
    const scoreStr = (100 / testcases.length).toFixed(0)
    testcases.forEach((tc) => {
      tc.score = scoreStr
    })

    emit("uploaded", res.data.id, testcases)
    message.success("上传成功")
  } catch {
    message.error("上传失败")
  } finally {
    isUploading.value = false
  }
}
</script>

<template>
  <n-flex vertical>
    <n-flex align="center" wrap>
      <n-select
        style="width: 120px"
        :options="availableLanguages"
        v-model:value="selectedLanguage"
        :disabled="!hasAnswerCode"
        placeholder="无答案"
      />
      <n-button size="small" :disabled="isRunning" @click="reset">清空</n-button>
      <n-button size="small" @click="add(1)">+1</n-button>
      <n-button size="small" @click="add(5)">+5</n-button>
      <n-tooltip :disabled="hasAnswerCode && hasAnyInput">
        <template #trigger>
          <span>
            <n-button
              size="small"
              type="success"
              :loading="isRunning"
              :disabled="!hasAnswerCode || !hasAnyInput"
              @click="run"
            >
              先运行
            </n-button>
          </span>
        </template>
        {{ !hasAnswerCode ? "请先在题目中填写答案代码" : "请先填写输入" }}
      </n-tooltip>
      <n-button
        size="small"
        type="primary"
        :loading="isUploading"
        :disabled="!canUpload"
        @click="upload"
      >
        上传
      </n-button>
    </n-flex>

    <n-flex
      v-for="(file, index) in files"
      :key="file.id"
      align="start"
      style="gap: 8px"
    >
      <n-flex vertical style="flex: 1">
        <span>{{ index + 1 }}.in</span>
        <n-input type="textarea" v-model:value="file.in" :rows="3" />
      </n-flex>
      <n-flex vertical style="flex: 1">
        <span>{{ index + 1 }}.out</span>
        <n-input
          type="textarea"
          v-model:value="file.out"
          :rows="3"
          :status="file.out ? (file.error ? 'error' : 'success') : undefined"
        />
      </n-flex>
      <n-button
        size="small"
        :disabled="files.length === 1"
        style="margin-top: 22px"
        @click="remove(index)"
      >
        删除
      </n-button>
    </n-flex>
  </n-flex>
</template>

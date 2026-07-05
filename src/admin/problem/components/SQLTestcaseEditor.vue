<script setup lang="ts">
import { downloadZip } from "client-zip"
import type { LANGUAGE, SQLDisplay, Testcase } from "utils/types"
import SQLDataTable from "oj/problem/components/SQLDataTable.vue"
import {
  generateSQLTestcase,
  getSQLTestcaseScripts,
  previewSQLTestcase,
  uploadTestcases,
} from "../../api"

interface ScriptEntry {
  id: number
  sql: string
  display: SQLDisplay | null
  error: string
  // 标准答案或题型改过之后，旧预览结果作废，需重新预览才能上传
  stale: boolean
}

interface Props {
  answers: { language: LANGUAGE; code: string }[]
  mode: "query" | "modify"
  problemId?: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  uploaded: [testCaseId: string, testCaseScore: Testcase[]]
}>()

const message = useMessage()

let nextId = 0
function blankEntry(): ScriptEntry {
  return { id: nextId++, sql: "", display: null, error: "", stale: false }
}

const scripts = ref<ScriptEntry[]>([blankEntry(), blankEntry(), blankEntry()])

const refSQL = computed(
  () =>
    props.answers.find((a) => a.language === "SQL" && a.code.trim())?.code ??
    "",
)

const isPreviewing = ref(false)
const isUploading = ref(false)
const isGenerating = ref(false)

const hasAnyScript = computed(() => scripts.value.some((s) => s.sql.trim()))
const hasBlankScript = computed(() => scripts.value.some((s) => !s.sql.trim()))

const filledCount = computed(
  () => scripts.value.filter((s) => s.sql.trim()).length,
)

const canUpload = computed(() => {
  const filled = scripts.value.filter((s) => s.sql.trim())
  return (
    !isPreviewing.value &&
    // 至少 2 个数据不同的测试点，防止学生对照题目页的期望结果硬编码
    filled.length >= 2 &&
    filled.every((s) => s.display && !s.error && !s.stale)
  )
})

watch([refSQL, () => props.mode], () => {
  for (const s of scripts.value) {
    if (s.display || s.error) s.stale = true
  }
})

// 编辑已有 SQL 题时回显已上传的脚本；新题或旧格式测试点则保持空白
onMounted(async () => {
  if (!props.problemId) return
  try {
    const res = await getSQLTestcaseScripts(props.problemId)
    if (res.data.length) {
      scripts.value = res.data.map((f) => ({ ...blankEntry(), sql: f.content }))
    }
  } catch {}
})

function add() {
  scripts.value.push(blankEntry())
}

function remove(index: number) {
  scripts.value.splice(index, 1)
}

function reset() {
  scripts.value = [blankEntry(), blankEntry(), blankEntry()]
}

function expectedQuery(d: SQLDisplay) {
  return "columns" in d.expected ? d.expected : null
}

function changedTables(d: SQLDisplay) {
  return "changed_tables" in d.expected ? d.expected.changed_tables : []
}

async function generate() {
  const blanks = scripts.value.filter((s) => !s.sql.trim())
  if (!blanks.length) return
  isGenerating.value = true
  await Promise.all(
    blanks.map(async (s) => {
      try {
        const res = await generateSQLTestcase({
          ref_sql: refSQL.value,
          mode: props.mode,
        })
        s.sql = res.data.sql
      } catch (err) {
        const data = (err as { data?: unknown })?.data
        message.error(typeof data === "string" ? data : "AI 生成失败")
      }
    }),
  )
  isGenerating.value = false
  await preview()
}

async function preview() {
  // 丢弃空脚本
  scripts.value = scripts.value.filter((s) => s.sql.trim())
  if (!scripts.value.length) {
    scripts.value = [blankEntry()]
    return
  }
  isPreviewing.value = true
  await Promise.all(
    scripts.value.map(async (s) => {
      s.display = null
      s.error = ""
      s.stale = false
      try {
        const res = await previewSQLTestcase({
          init_sql: s.sql,
          ref_sql: refSQL.value,
          mode: props.mode,
        })
        s.display = res.data
      } catch (err) {
        const data = (err as { data?: unknown })?.data
        s.error = typeof data === "string" ? data : "预览失败"
      }
    }),
  )
  isPreviewing.value = false
}

async function upload() {
  isUploading.value = true
  try {
    const now = new Date()
    const data = scripts.value
      .filter((s) => s.sql.trim())
      .map((s, i) => ({
        name: `${i + 1}.sql`,
        input: s.sql,
        lastModified: now,
      }))
    const blob = await downloadZip(data).blob()
    const file = new File([blob], "testcase.zip", { type: "application/zip" })

    const res = await uploadTestcases(file, { sql: true })
    const testcases: Testcase[] = res.data.info
    const baseScore = Math.floor(100 / testcases.length)
    const remainder = 100 - baseScore * testcases.length
    testcases.forEach((tc, i) => {
      tc.score = String(
        i === testcases.length - 1 ? baseScore + remainder : baseScore,
      )
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
    <n-alert
      v-if="!refSQL"
      type="warning"
      :show-icon="false"
      style="margin-bottom: 8px"
    >
      还没有填写 SQL 标准答案，请先在上方"本题参考答案"中填写，再来编写测试点
    </n-alert>
    <n-flex align="center" wrap>
      <n-button :disabled="isPreviewing || isGenerating" @click="reset">
        清空
      </n-button>
      <n-button :disabled="isPreviewing || isGenerating" @click="add">
        +1
      </n-button>
      <n-tooltip :disabled="!!refSQL && hasBlankScript">
        <template #trigger>
          <span>
            <n-button
              :loading="isGenerating"
              :disabled="!refSQL || !hasBlankScript || isPreviewing"
              @click="generate"
            >
              AI 生成
            </n-button>
          </span>
        </template>
        {{ !refSQL ? "请先填写 SQL 标准答案" : "所有脚本都写好了，无需生成" }}
      </n-tooltip>
      <n-tooltip :disabled="!!refSQL && hasAnyScript">
        <template #trigger>
          <span>
            <n-button
              type="success"
              :loading="isPreviewing"
              :disabled="!refSQL || !hasAnyScript || isGenerating"
              @click="preview"
            >
              预览验证
            </n-button>
          </span>
        </template>
        {{ !refSQL ? "请先填写 SQL 标准答案" : "请先填写数据脚本" }}
      </n-tooltip>
      <n-tooltip :disabled="canUpload || isPreviewing">
        <template #trigger>
          <span>
            <n-button
              type="primary"
              :loading="isUploading"
              :disabled="!canUpload || isGenerating"
              @click="upload"
            >
              上传
            </n-button>
          </span>
        </template>
        {{
          filledCount < 2
            ? "SQL 题至少需要 2 个数据不同的测试点，防止硬编码期望结果"
            : "所有脚本预览验证通过后才能上传"
        }}
      </n-tooltip>
    </n-flex>

    <div v-for="(s, index) in scripts" :key="s.id" class="scriptBox">
      <n-flex justify="space-between" align="center">
        <strong>{{ index + 1 }}.sql</strong>
        <n-button
          size="small"
          :disabled="scripts.length === 1 || isPreviewing || isGenerating"
          @click="remove(index)"
        >
          删除
        </n-button>
      </n-flex>
      <n-input
        type="textarea"
        v-model:value="s.sql"
        :rows="8"
        placeholder="-- 本测试点的建表 + 插入数据脚本
CREATE TABLE ...;
INSERT INTO ...;"
        :status="
          s.error ? 'error' : s.display && !s.stale ? 'success' : undefined
        "
      />
      <n-alert v-if="s.error" type="error" :show-icon="false">
        {{ s.error }}
      </n-alert>
      <template v-if="s.display">
        <n-alert v-if="s.stale" type="warning" :show-icon="false">
          标准答案或题型已修改，以下预览已过期，请重新预览
        </n-alert>
        <div :class="{ stalePreview: s.stale }">
          <p class="previewTitle">数据表</p>
          <div v-for="t in s.display.tables" :key="t.name">
            <p class="sqlTableName">{{ t.name }}</p>
            <SQLDataTable
              :columns="t.columns"
              :rows="t.rows"
              :total-rows="t.total_rows"
              :truncated="t.truncated"
            />
          </div>
          <p class="previewTitle">期望结果</p>
          <SQLDataTable
            v-if="expectedQuery(s.display)"
            :columns="expectedQuery(s.display)!.columns"
            :rows="expectedQuery(s.display)!.rows"
            :total-rows="expectedQuery(s.display)!.total_rows"
            :truncated="expectedQuery(s.display)!.truncated"
          />
          <div v-for="t in changedTables(s.display)" :key="t.name">
            <p class="sqlTableName">
              {{ t.dropped ? `${t.name} 表已被删除` : `执行后的 ${t.name} 表` }}
            </p>
            <SQLDataTable
              v-if="!t.dropped"
              :columns="t.columns"
              :rows="t.rows"
              :total-rows="t.total_rows"
              :truncated="t.truncated"
            />
          </div>
        </div>
      </template>
    </div>
  </n-flex>
</template>

<style scoped>
.scriptBox {
  border: 1px solid var(--n-border-color, rgba(128, 128, 128, 0.2));
  border-radius: 6px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.previewTitle {
  font-weight: bold;
  margin: 4px 0;
}

.sqlTableName {
  font-weight: 500;
  margin: 4px 0;
  opacity: 0.85;
}

.stalePreview {
  opacity: 0.45;
}
</style>

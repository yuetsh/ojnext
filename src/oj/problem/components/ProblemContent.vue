<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { useThemeVars } from "naive-ui"
import { storeToRefs } from "pinia"
import { useCodeStore } from "oj/store/code"
import { useProblemStore } from "oj/store/problem"
import { createTestSubmission } from "utils/judge"
import { DIFFICULTY } from "utils/constants"
import type { Problem, ProblemStatus } from "utils/types"
import Copy from "shared/components/Copy.vue"
import { useDark } from "@vueuse/core"
import { MdPreview } from "md-editor-v3"
import "md-editor-v3/lib/preview.css"
import { getSimilarProblems } from "oj/api"

type Sample = Problem["samples"][number] & {
  id: number
  msg: string
  status: ProblemStatus
  loading: boolean
}

const theme = useThemeVars()
const style = computed(() => "color: " + theme.value.primaryColor)
const isDark = useDark()
const route = useRoute()
const codeStore = useCodeStore()
const problemStore = useProblemStore()
const { problem } = storeToRefs(problemStore)

const problemSetId = computed(() => route.params.problemSetId)

const router = useRouter()

// 相似题目推荐
const similarProblems = ref<any[]>([])
const similarLoaded = ref(false)

async function loadSimilarProblems() {
  if (similarLoaded.value || !problem.value) return
  try {
    const res = await getSimilarProblems(problem.value._id)
    similarProblems.value = res.data || []
  } catch {
    similarProblems.value = []
  }
  similarLoaded.value = true
}

// 切换题目时重置相似推荐状态
watch(
  () => problem.value?._id,
  () => {
    similarProblems.value = []
    similarLoaded.value = false
  },
)

// AC 或失败次数 >= 3 时加载推荐
watch(
  () => [problem.value?._id, problem.value?.my_status, problemStore.failCount],
  ([, status, failCount]) => {
    if (status === 0 || (failCount as number) >= 3) {
      loadSimilarProblems()
    }
  },
  { immediate: true },
)

const hasTriedButNotPassed = computed(() => {
  return (
    problem.value?.my_status !== undefined &&
    problem.value?.my_status !== null &&
    problem.value?.my_status !== 0
  )
})

const samples = ref<Sample[]>(
  problem.value!.samples.map((sample, index) => ({
    ...sample,
    id: index,
    msg: "",
    status: "not_test",
    loading: false,
  })),
)

const NODE_TARGET_LABELS: Record<string, string> = {
  for_loop: "for 循环",
  while_loop: "while 循环",
  if_statement: "if 条件",
  else_clause: "else 子句",
  function_definition: "函数定义",
  return: "return 语句",
  break: "break 语句",
  continue: "continue 语句",
  list_comprehension: "列表推导式",
  list_literal: "列表",
  dict_literal: "字典",
  set_literal: "集合",
  f_string: "f-string",
  try_except: "try-except",
  class_definition: "类定义",
}

type AstRule = { engine: string; target?: string; min?: number; max?: number; message: string }

function ruleDescription(rule: AstRule): string {
  const target = rule.target || ""
  const targetLabel = NODE_TARGET_LABELS[target] || target
  const range = (min?: number, max?: number) => {
    if (min !== undefined && max !== undefined) return `${min}～${max} 次`
    if (min !== undefined) return `至少 ${min} 次`
    if (max !== undefined) return `至多 ${max} 次`
    return ""
  }
  switch (rule.engine) {
    case "must_exist_node": return `必须使用 ${targetLabel}`
    case "must_not_exist_node": return `不能使用 ${targetLabel}`
    case "count_node": return `${targetLabel} 出现次数 ${range(rule.min, rule.max)}`
    case "must_call_function": return `必须调用函数 ${target}`
    case "must_not_call_function": return `不能调用函数 ${target}`
    case "count_function_call": return `函数 ${target} 调用次数 ${range(rule.min, rule.max)}`
    case "must_call_method": return `必须调用方法 ${target}`
    case "must_not_call_method": return `不能调用方法 ${target}`
    case "must_use_operator": return `必须使用运算符 ${target}`
    default: return rule.message || rule.engine
  }
}

function ruleTagType(engine: string): "error" | "success" | "info" {
  if (engine.startsWith("must_not")) return "error"
  if (engine.startsWith("must")) return "success"
  return "info"
}

const astRulesForDisplay = computed(() => {
  if (!problem.value?.ast_rules) return []
  return Object.entries(problem.value.ast_rules).filter(([, rules]) => rules.length > 0)
})

async function test(sample: Sample, index: number) {
  samples.value = samples.value.map((sample) => {
    if (sample.id === index) {
      sample.loading = true
    }
    return sample
  })
  const res = await createTestSubmission(codeStore.code, sample.input)
  samples.value = samples.value.map((sample) => {
    if (sample.id === index) {
      const status =
        res.status === 3 && res.output.trim() === sample.output
          ? "passed"
          : "failed"
      return {
        ...sample,
        msg: res.output,
        status: status,
        loading: false,
      }
    } else {
      return sample
    }
  })

  const id = setTimeout(() => {
    clearTimeout(id)
    samples.value = samples.value.map((sample) => {
      if (sample.id === index) {
        return {
          ...sample,
          msg: res.output,
          status: "not_test",
          loading: false,
        }
      } else {
        return sample
      }
    })
  }, 2000)
}

function label(status: ProblemStatus, loading: boolean) {
  if (loading) return "测试中"
  return {
    not_test: "测试",
    failed: "不通过",
    passed: "通过",
  }[status]
}

function type(status: ProblemStatus) {
  return {
    not_test: "",
    failed: "error",
    passed: "success",
  }[status] as "warning" | "error" | "success"
}
</script>

<template>
  <div v-if="problem">
    <template v-if="!problemSetId">
      <!-- 已通过 -->
      <n-alert
        class="status-alert"
        v-if="problem.my_status === 0"
        type="success"
        title="🎉 本 题 已 经 被 你 解 决 啦"
      >
      </n-alert>

      <!-- 尝试过但未通过 -->
      <n-alert
        class="status-alert"
        v-else-if="hasTriedButNotPassed"
        type="warning"
        title="💪 你已经尝试过这道题，但还没有通过"
      >
        不要放弃！仔细检查代码逻辑，或者寻求 AI 的帮助获取灵感。
      </n-alert>
    </template>

    <n-flex align="center">
      <n-tag>{{ problem._id }}</n-tag>
      <h2 class="problemTitle">{{ problem.title }}</h2>
    </n-flex>
    <p class="title" :style="style">
      <n-flex align="center">
        <Icon icon="streamline-emojis:sparkles"></Icon>
        描述
      </n-flex>
    </p>
    <MdPreview
      preview-theme="vuepress"
      :model-value="problem.description"
      :theme="isDark ? 'dark' : 'light'"
    />

    <p class="title" :style="style">
      <n-flex align="center">
        <Icon icon="streamline-emojis:four-leaf-clover"></Icon>
        输入
      </n-flex>
    </p>
    <MdPreview
      preview-theme="vuepress"
      :model-value="problem.input_description"
      :theme="isDark ? 'dark' : 'light'"
    />

    <p class="title" :style="style">
      <n-flex align="center">
        <Icon icon="streamline-emojis:herb"></Icon>
        输出
      </n-flex>
    </p>
    <MdPreview
      preview-theme="vuepress"
      :model-value="problem.output_description"
      :theme="isDark ? 'dark' : 'light'"
    />

    <div v-if="problem.hint">
      <p class="title" :style="style">
        <n-flex align="center">
          <Icon icon="streamline-emojis:seedling"></Icon>
          提示
        </n-flex>
      </p>
      <MdPreview
        preview-theme="preview"
        :model-value="problem.hint"
        :theme="isDark ? 'dark' : 'light'"
      />
    </div>

    <!-- 代码要求（AST 规则） -->
    <div v-if="astRulesForDisplay.length > 0">
      <p class="title" :style="style">
        <n-flex align="center">
          <Icon icon="streamline-emojis:open-book"></Icon>
          要求
        </n-flex>
      </p>
      <div v-for="[lang, rules] in astRulesForDisplay" :key="lang">
        <p v-if="astRulesForDisplay.length > 1" class="lang-label">{{ lang }}</p>
        <n-list bordered style="margin-bottom: 8px">
          <n-list-item v-for="(rule, i) in rules" :key="i">
            <n-flex align="center">
              <n-tag size="small" :type="ruleTagType(rule.engine)">
                {{ ruleDescription(rule) }}
              </n-tag>
              <span v-if="rule.message" class="rule-message">{{ rule.message }}</span>
            </n-flex>
          </n-list-item>
        </n-list>
      </div>
    </div>

    <div v-for="(sample, index) of samples" :key="index">
      <n-flex align="center">
        <p class="title" :style="style">例子 {{ index + 1 }}</p>
        <n-button
          size="small"
          :type="type(sample.status)"
          @click="test(sample, index)"
        >
          {{ label(sample.status, sample.loading) }}
        </n-button>
      </n-flex>
      <n-descriptions
        bordered
        :column="2"
        label-style="width: 50%; min-width: 100px"
      >
        <n-descriptions-item>
          <template #label>
            <n-flex>
              <span>输入</span>
              <Copy :value="sample.input" />
            </n-flex>
          </template>
          <div class="testcase">{{ sample.input }}</div>
        </n-descriptions-item>
        <n-descriptions-item>
          <template #label>
            <n-flex>
              <span>输出</span>
              <Copy :value="sample.output" />
            </n-flex>
          </template>
          <div class="testcase">{{ sample.output }}</div>
        </n-descriptions-item>
        <n-descriptions-item label="运行结果" v-if="sample.msg">
          <div class="testcase">{{ sample.msg }}</div>
        </n-descriptions-item>
      </n-descriptions>
    </div>

    <div v-if="problem.source">
      <p class="title" :style="style">来源</p>
      <MdPreview
        preview-theme="vuepress"
        :model-value="problem.source"
        :theme="isDark ? 'dark' : 'light'"
      />
    </div>

    <!-- 相似题目推荐 -->
    <div v-if="similarProblems.length > 0">
      <n-divider />
      <p class="title" :style="style">
        <n-flex align="center">
          <Icon icon="fluent-emoji-flat:light-bulb"></Icon>
          相似题目推荐
        </n-flex>
      </p>
      <n-list bordered>
        <n-list-item v-for="sp in similarProblems" :key="sp._id">
          <n-flex align="center" justify="space-between">
            <n-flex align="center">
              <n-tag size="small">{{ sp._id }}</n-tag>
              <n-button
                text
                type="info"
                @click="
                  router.push({
                    name: 'problem',
                    params: { problemID: sp._id },
                  })
                "
              >
                {{ sp.title }}
              </n-button>
            </n-flex>
            <n-tag
              size="small"
              :type="
                sp.difficulty === 'Low'
                  ? 'success'
                  : sp.difficulty === 'High'
                    ? 'error'
                    : 'warning'
              "
            >
              {{
                DIFFICULTY[sp.difficulty as keyof typeof DIFFICULTY] || "中等"
              }}
            </n-tag>
          </n-flex>
        </n-list-item>
      </n-list>
    </div>
  </div>
</template>

<style scoped>
.problemTitle {
  margin: 0;
}

.title {
  font-size: 20px;
  margin: 12px 0;
}

.testcase {
  font-size: 14px;
  white-space: pre;
  font-family: "Monaco";
}

.status-alert {
  margin-bottom: 16px;
}

.lang-label {
  font-weight: 600;
  margin: 8px 0 4px;
}

.rule-message {
  font-size: 13px;
  opacity: 0.65;
}
</style>

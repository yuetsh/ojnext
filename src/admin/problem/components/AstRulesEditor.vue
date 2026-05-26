<script setup lang="ts">
import type { LANGUAGE } from "utils/types"

interface AstRule {
  engine: string
  target?: string
  label?: string
  exact?: number
  min?: number
  max?: number
  message: string
}

interface Props {
  modelValue: { [key: string]: AstRule[] } | null
  languages: LANGUAGE[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: "update:modelValue", value: { [key: string]: AstRule[] } | null): void
}>()

const activeTab = ref(props.languages[0] || "Python3")

const ENGINE_OPTIONS: SelectOption[] = [
  { label: "节点检查", type: "group", key: "node_group", children: [
    { label: "必须存在", value: "must_exist_node" },
    { label: "不能存在", value: "must_not_exist_node" },
    { label: "出现次数", value: "count_node" },
  ]},
  { label: "函数调用", type: "group", key: "func_group", children: [
    { label: "必须调用函数", value: "must_call_function" },
    { label: "不能调用函数", value: "must_not_call_function" },
    { label: "函数调用次数", value: "count_function_call" },
  ]},
  { label: "方法调用", type: "group", key: "method_group", children: [
    { label: "必须调用方法", value: "must_call_method" },
    { label: "不能调用方法", value: "must_not_call_method" },
  ]},
  { label: "运算符", type: "group", key: "op_group", children: [
    { label: "必须使用运算符", value: "must_use_operator" },
  ]},
]

const NODE_TARGET_OPTIONS: SelectOption[] = [
  { label: "for 循环", value: "for_loop" },
  { label: "while 循环", value: "while_loop" },
  { label: "if 条件", value: "if_statement" },
  { label: "else 子句", value: "else_clause" },
  { label: "函数定义", value: "function_definition" },
  { label: "return 语句", value: "return" },
  { label: "break 语句", value: "break" },
  { label: "continue 语句", value: "continue" },
  { label: "列表推导式", value: "list_comprehension" },
  { label: "列表", value: "list_literal" },
  { label: "字典", value: "dict_literal" },
  { label: "集合", value: "set_literal" },
  { label: "f-string", value: "f_string" },
  { label: "try-except", value: "try_except" },
  { label: "类定义", value: "class_definition" },
]

const OPERATOR_TARGET_OPTIONS: SelectOption[] = [
  { label: "+", value: "+" },
  { label: "-", value: "-" },
  { label: "*", value: "*" },
  { label: "/", value: "/" },
  { label: "//", value: "//" },
  { label: "%", value: "%" },
  { label: "**", value: "**" },
  { label: "+=", value: "+=" },
  { label: "-=", value: "-=" },
  { label: "==", value: "==" },
  { label: "!=", value: "!=" },
  { label: ">", value: ">" },
  { label: ">=", value: ">=" },
  { label: "<", value: "<" },
  { label: "<=", value: "<=" },
  { label: "and / &&", value: "and" },
  { label: "or / ||", value: "or" },
  { label: "not / !", value: "not" },
]

const NODE_ENGINES = ["must_exist_node", "must_not_exist_node", "count_node"]
const FUNCTION_ENGINES = ["must_call_function", "must_not_call_function", "count_function_call"]
const METHOD_ENGINES = ["must_call_method", "must_not_call_method"]
const OPERATOR_ENGINES = ["must_use_operator"]
const COUNT_ENGINES = ["count_node", "count_function_call"]

function isNodeEngine(engine: string) { return NODE_ENGINES.includes(engine) }
function isFunctionEngine(engine: string) { return FUNCTION_ENGINES.includes(engine) }
function isMethodEngine(engine: string) { return METHOD_ENGINES.includes(engine) }
function isOperatorEngine(engine: string) { return OPERATOR_ENGINES.includes(engine) }
function isCountEngine(engine: string) { return COUNT_ENGINES.includes(engine) }

const COUNT_MODE_OPTIONS: SelectOption[] = [
  { label: "精确", value: "exact" },
  { label: "范围", value: "range" },
]

function getCountMode(rule: AstRule): "exact" | "range" {
  return rule.exact !== undefined ? "exact" : "range"
}

function updateCountMode(lang: string, index: number, mode: "exact" | "range") {
  const rules = [...getRulesForLang(lang)]
  const rule = { ...rules[index] }
  if (mode === "exact") {
    rule.exact = rule.min ?? 1
    delete rule.min
    delete rule.max
  } else {
    delete rule.exact
  }
  rules[index] = rule
  updateRules(lang, rules)
}

function updateExactCount(lang: string, index: number, v: number | null) {
  const rules = [...getRulesForLang(lang)]
  const rule = { ...rules[index] }
  if (v === null) delete rule.exact
  else rule.exact = v
  rules[index] = rule
  updateRules(lang, rules)
}

function needsTargetDropdown(engine: string) { return isNodeEngine(engine) }
function needsTargetInput(engine: string) { return isFunctionEngine(engine) || isMethodEngine(engine) }
function needsOperatorDropdown(engine: string) { return isOperatorEngine(engine) }

function getRulesForLang(lang: string): AstRule[] {
  if (!props.modelValue) return []
  return props.modelValue[lang] || []
}

function updateRules(lang: string, rules: AstRule[]) {
  const current = { ...(props.modelValue || {}) }
  if (rules.length === 0) {
    delete current[lang]
  } else {
    current[lang] = rules
  }
  emit("update:modelValue", Object.keys(current).length > 0 ? current : null)
}

function getTargetLabel(engine: string, target: string): string | undefined {
  if (isNodeEngine(engine))
    return (NODE_TARGET_OPTIONS.find((o) => o.value === target) as any)?.label
  if (isOperatorEngine(engine))
    return (OPERATOR_TARGET_OPTIONS.find((o) => o.value === target) as any)?.label
  return undefined
}

function addRule(lang: string) {
  const rules = [...getRulesForLang(lang)]
  rules.push({ engine: "must_exist_node", target: "for_loop", label: "for 循环", message: "" })
  updateRules(lang, rules)
}

function removeRule(lang: string, index: number) {
  const rules = [...getRulesForLang(lang)]
  rules.splice(index, 1)
  updateRules(lang, rules)
}

function updateRule(lang: string, index: number, field: string, value: any) {
  const rules = [...getRulesForLang(lang)]
  const rule = { ...rules[index] }

  if (field === "engine") {
    rule.engine = value
    if (isNodeEngine(value)) { rule.target = "for_loop"; rule.label = "for 循环" }
    else if (isOperatorEngine(value)) { rule.target = "+"; rule.label = "+" }
    else { rule.target = ""; delete rule.label }
    delete rule.min
    delete rule.max
    delete rule.exact
  } else if (field === "target") {
    rule.target = value
    const lbl = getTargetLabel(rule.engine, value)
    if (lbl) rule.label = lbl
    else delete rule.label
  } else if (field === "min") {
    if (value === null || value === undefined) delete rule.min
    else rule.min = value
  } else if (field === "max") {
    if (value === null || value === undefined) delete rule.max
    else rule.max = value
  } else if (field === "message") {
    rule.message = value
  }

  rules[index] = rule
  updateRules(lang, rules)
}

watch(() => props.languages, (langs) => {
  if (langs.length && !langs.includes(activeTab.value as LANGUAGE)) {
    activeTab.value = langs[0]
  }
})
</script>

<template>
  <n-collapse>
    <n-collapse-item title="代码规则检查（选填）" name="ast-rules">
      <n-tabs v-if="languages.length" type="segment" v-model:value="activeTab">
        <n-tab-pane v-for="lang in languages" :key="lang" :name="lang" :tab="lang">
          <n-flex vertical>
            <div v-for="(rule, index) in getRulesForLang(lang)" :key="index" style="margin-bottom: 8px">
              <n-flex align="center" :wrap="false">
                <n-select
                  :options="ENGINE_OPTIONS"
                  :value="rule.engine"
                  @update:value="(v: string) => updateRule(lang, index, 'engine', v)"
                  style="width: 150px"
                  size="small"
                />
                <n-select
                  v-if="needsTargetDropdown(rule.engine)"
                  :options="NODE_TARGET_OPTIONS"
                  :value="rule.target"
                  @update:value="(v: string) => updateRule(lang, index, 'target', v)"
                  style="width: 150px"
                  size="small"
                  filterable
                />
                <n-input
                  v-if="needsTargetInput(rule.engine)"
                  :value="rule.target"
                  @update:value="(v: string) => updateRule(lang, index, 'target', v)"
                  placeholder="函数/方法名"
                  style="width: 150px"
                  size="small"
                />
                <n-select
                  v-if="needsOperatorDropdown(rule.engine)"
                  :options="OPERATOR_TARGET_OPTIONS"
                  :value="rule.target"
                  @update:value="(v: string) => updateRule(lang, index, 'target', v)"
                  style="width: 150px"
                  size="small"
                />
                <template v-if="isCountEngine(rule.engine)">
                  <n-select
                    :options="COUNT_MODE_OPTIONS"
                    :value="getCountMode(rule)"
                    @update:value="(v: 'exact' | 'range') => updateCountMode(lang, index, v)"
                    style="width: 80px"
                    size="small"
                  />
                  <n-input-number
                    v-if="getCountMode(rule) === 'exact'"
                    :value="rule.exact ?? null"
                    @update:value="(v: number | null) => updateExactCount(lang, index, v)"
                    placeholder="次数"
                    style="width: 100px"
                    size="small"
                    :min="1"
                    clearable
                  />
                  <template v-else>
                    <n-input-number
                      :value="rule.min ?? null"
                      @update:value="(v: number | null) => updateRule(lang, index, 'min', v)"
                      placeholder="最少"
                      style="width: 100px"
                      size="small"
                      :min="0"
                      clearable
                    />
                    <n-input-number
                      :value="rule.max ?? null"
                      @update:value="(v: number | null) => updateRule(lang, index, 'max', v)"
                      placeholder="最多"
                      style="width: 100px"
                      size="small"
                      :min="0"
                      clearable
                    />
                  </template>
                </template>
                <n-input
                  :value="rule.message"
                  @update:value="(v: string) => updateRule(lang, index, 'message', v)"
                  placeholder="错误提示（选填）"
                  style="flex: 1"
                  size="small"
                />
                <n-button size="small" tertiary type="error" @click="removeRule(lang, index)">
                  删除
                </n-button>
              </n-flex>
            </div>
            <n-button size="small" tertiary type="primary" @click="addRule(lang)">
              添加规则
            </n-button>
          </n-flex>
        </n-tab-pane>
      </n-tabs>
      <n-empty v-else description="请先选择编程语言" />
    </n-collapse-item>
  </n-collapse>
</template>

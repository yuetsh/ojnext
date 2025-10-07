import { defineStore } from "pinia"
import { STORAGE_KEY } from "utils/constants"
import storage from "utils/storage"
import { Code, LANGUAGE } from "utils/types"

/**
 * 代码编辑器状态管理 Store
 * 管理全局的代码、输入、输出状态
 */
export const useCodeStore = defineStore("code", () => {
  // ==================== 状态 ====================
  const code = reactive<Code>({
    value: "",
    language: storage.get(STORAGE_KEY.LANGUAGE) || "Python3",
  })

  const input = ref("")
  const output = ref("")

  // ==================== 计算属性 ====================
  const isEmpty = computed(() => code.value.trim() === "")

  // ==================== 操作 ====================
  /**
   * 设置代码内容
   */
  function setCode(value: string) {
    code.value = value
  }

  /**
   * 设置编程语言
   */
  function setLanguage(language: LANGUAGE) {
    code.language = language
    storage.set(STORAGE_KEY.LANGUAGE, language)
  }

  /**
   * 设置输入
   */
  function setInput(value: string) {
    input.value = value
  }

  /**
   * 设置输出
   */
  function setOutput(value: string) {
    output.value = value
  }

  /**
   * 重置所有状态
   */
  function reset() {
    code.value = ""
    input.value = ""
    output.value = ""
  }

  /**
   * 清空输出
   */
  function clearOutput() {
    output.value = ""
  }

  // 监听语言变化，保存到本地存储
  watch(
    () => code.language,
    (newLanguage) => {
      storage.set(STORAGE_KEY.LANGUAGE, newLanguage)
    },
  )

  return {
    // 状态
    code,
    input,
    output,

    // 计算属性
    isEmpty,

    // 操作
    setCode,
    setLanguage,
    setInput,
    setOutput,
    reset,
    clearOutput,
  }
})

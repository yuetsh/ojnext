import { defineStore } from "pinia"
import { LANGUAGE, Problem } from "utils/types"

/**
 * 题目状态管理 Store
 * 管理当前题目的信息
 */
export const useProblemStore = defineStore("problem", () => {
  // ==================== 状态 ====================
  const problem = ref<Problem | null>(null)

  // ==================== 计算属性 ====================
  const languages = computed<LANGUAGE[]>(() => {
    if (problem.value?.allow_flowchart) {
      return ["Flowchart", ...problem.value?.languages]
    }
    return problem.value?.languages ?? []
  })

  // ==================== 操作 ====================
  /**
   * 设置当前题目
   */
  function setProblem(newProblem: Problem | null) {
    problem.value = newProblem
  }

  /**
   * 清空当前题目
   */
  function clearProblem() {
    problem.value = null
  }

  /**
   * 更新题目的部分字段
   */
  function updateProblem(updates: Partial<Problem>) {
    if (problem.value) {
      problem.value = { ...problem.value, ...updates }
    }
  }

  return {
    // 状态
    problem,

    // 计算属性
    languages,

    // 操作
    setProblem,
    clearProblem,
    updateProblem,
  }
})

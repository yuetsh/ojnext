import { defineStore } from "pinia"
import { Problem } from "utils/types"

/**
 * 题目状态管理 Store
 * 管理当前题目的信息
 */
export const useProblemStore = defineStore("problem", () => {
  // ==================== 状态 ====================
  const problem = ref<Problem | null>(null)

  // ==================== 计算属性 ====================
  const hasProblem = computed(() => problem.value !== null)

  const problemId = computed(() => problem.value?._id ?? null)

  const problemTitle = computed(() => problem.value?.title ?? "")

  const difficulty = computed(() => problem.value?.difficulty ?? "")

  const languages = computed(() => problem.value?.languages ?? [])

  const isACed = computed(() => problem.value?.my_status === 0)

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
    hasProblem,
    problemId,
    problemTitle,
    difficulty,
    languages,
    isACed,

    // 操作
    setProblem,
    clearProblem,
    updateProblem,
  }
})

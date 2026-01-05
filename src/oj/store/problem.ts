import { defineStore } from "pinia"
import { LANGUAGE, Problem } from "utils/types"

/**
 * 题目状态管理 Store
 * 管理当前题目的信息
 */
export const useProblemStore = defineStore("problem", () => {
  // ==================== 状态 ====================
  const problem = ref<Problem | null>(null)
  const route = useRoute()

  // ==================== 计算属性 ====================
  const languages = computed<LANGUAGE[]>(() => {
    if (route.name === "problem" && problem.value?.allow_flowchart) {
      return ["Flowchart", ...problem.value?.languages]
    }
    return problem.value?.languages ?? []
  })

  return {
    // 状态
    problem,

    // 计算属性
    languages,
  }
})

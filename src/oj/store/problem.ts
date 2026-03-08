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

  // 本次会话内累计的失败次数（与服务端 my_failed_count 叠加）
  const localFailCount = ref(0)

  // ==================== 计算属性 ====================
  const languages = computed<LANGUAGE[]>(() => {
    if (route.name === "problem" && problem.value?.allow_flowchart) {
      return ["Flowchart", ...problem.value?.languages]
    }
    return problem.value?.languages ?? []
  })

  const totalFailCount = computed(
    () => (problem.value?.my_failed_count ?? 0) + localFailCount.value,
  )

  function incrementFailCount() {
    localFailCount.value++
  }

  // 切题时重置
  watch(
    () => problem.value?.id,
    () => {
      localFailCount.value = 0
    },
  )

  return {
    problem,
    localFailCount,
    languages,
    totalFailCount,
    incrementFailCount,
  }
})

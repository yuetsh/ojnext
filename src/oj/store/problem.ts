import { defineStore } from "pinia"
import type { LANGUAGE, Problem } from "utils/types"

export const useProblemStore = defineStore("problem", () => {
  const problem = ref<Problem | null>(null)
  const route = useRoute()

  const failCount = ref(0)

  const languages = computed<LANGUAGE[]>(() => {
    if (route.name === "problem" && problem.value?.allow_flowchart) {
      return ["Flowchart", ...problem.value?.languages]
    }
    return problem.value?.languages ?? []
  })

  function incrementFailCount() {
    failCount.value++
  }

  watch(
    () => problem.value?.id,
    () => {
      failCount.value = 0
    },
  )

  return {
    problem,
    failCount,
    languages,
    incrementFailCount,
  }
})

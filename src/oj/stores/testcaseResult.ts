import { Code } from "../../utils/types"

export const useTestcaseReultStore = defineStore("testcaseResult", () => {
  const result = ref({})

  async function runTestcase(code: Code, sample: string) {
    console.log(code, sample)
  }

  return { result, runTestcase }
})

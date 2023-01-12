import { Code, LANGUAGE } from "../../utils/types"

export const useCodeStore = defineStore("code", () => {
  const code = reactive<Code>({
    value: "",
    language: "C",
  })

  return { code }
})

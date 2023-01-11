import { Code, LANGUAGE } from "../../utils/types"

export const useCodeStore = defineStore("code", () => {
  const code = reactive<Code>({
    value: "",
    language: "C",
  })

  function setValue(value: string) {
    code.value = value
  }

  function setLanguage(language: LANGUAGE) {
    code.language = language
  }

  return { code, setLanguage, setValue }
})

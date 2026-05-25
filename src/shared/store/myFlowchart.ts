import { defineStore } from "pinia"

export const useMyFlowchartStore = defineStore("myFlowchart", () => {
  const showing = ref(false)
  const mermaidCode = ref("")

  function show(code: string) {
    mermaidCode.value = code
    showing.value = true
  }

  function hide() {
    showing.value = false
    mermaidCode.value = ""
  }

  return { showing, mermaidCode, show, hide }
})

import { defineStore } from "pinia"

export const usePinnedFlowchartStore = defineStore("pinnedFlowchart", () => {
  const isPinned = ref(false)
  const mermaidCode = ref("")

  function pin(code: string) {
    mermaidCode.value = code
    isPinned.value = true
  }

  function unpin() {
    isPinned.value = false
    mermaidCode.value = ""
  }

  return { isPinned, mermaidCode, pin, unpin }
})

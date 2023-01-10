import { useToggle } from "@vueuse/core"
import { defineStore } from "pinia"

export const useLoginStore = defineStore("login", () => {
  const [visible] = useToggle()

  function show() {
    visible.value = true
  }

  function hide() {
    visible.value = false
  }

  return { visible, show, hide }
})

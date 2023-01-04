import { defineStore } from "pinia"
import { ref } from "vue"

export const useLoginStore = defineStore("login", () => {
  const visible = ref(false)

  function show() {
    visible.value = true
  }

  function hide() {
    visible.value = false
  }

  return { visible, show, hide }
})

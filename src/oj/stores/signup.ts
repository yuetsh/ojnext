import { defineStore } from "pinia"
import { ref } from "vue"

export const useSignupStore = defineStore("signup", () => {
  const visible = ref(false)

  function show() {
    visible.value = true
  }

  function hide() {
    visible.value = false
  }

  return { visible, show, hide }
})

export const useSignupStore = defineStore("signup", () => {
  const [visible] = useToggle()

  function show() {
    visible.value = true
  }

  function hide() {
    visible.value = false
  }

  return { visible, show, hide }
})

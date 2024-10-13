import sidebar from "./menu.md?raw"

export const useLearnStore = defineStore("learn", () => {
  const route = useRoute()
  const router = useRouter()

  const code = ref("")
  const input = ref("")
  const output = ref("黄岩一职")
  const showCode = ref(true)
  const currentTitle = ref("")

  const current = computed(() => {
    if (!route.params.step || !route.params.step.length) return 1
    else {
      return parseInt(route.params.step[0])
    }
  })

  const dirname = computed(() => current.value.toString().padStart(2, "0"))

  const menu: DropdownOption[] = sidebar
    .split("\n")
    .filter((title) => !!title)
    .map((title: string, index) => {
      const dirname = (index + 1).toString().padStart(2, "0")
      const prefix = `第 ${index + 1} 课：`
      return {
        key: dirname,
        label: prefix + title,
        props: {
          onClick: () => {
            router.push(`/learn/${dirname}`)
            currentTitle.value = prefix + title
          },
        },
      }
    })

  function next() {
    if (current.value === menu.length) return
    const dest = (current.value + 1).toString().padStart(2, "0")
    router.push("/learn/" + dest)
  }

  function prev() {
    if (current.value === 1) return
    const dest = (current.value - 1).toString().padStart(2, "0")
    router.push("/learn/" + dest)
  }

  return {
    code,
    input,
    output,
    showCode,
    currentTitle,
    total: menu.length,
    current,
    dirname,
    menu,
    next,
    prev,
  }
})

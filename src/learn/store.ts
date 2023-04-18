import sidebar from "./menu.md?raw"

export const useLearnStore = defineStore("learn", () => {
  const route = useRoute()
  const router = useRouter()

  const current = computed(() => {
    if (!route.params.step || !route.params.step.length) return 1
    else {
      return parseInt(route.params.step[0].split("-")[1])
    }
  })

  const menu: DropdownOption[] = sidebar
    .split("\n")
    .filter((title) => !!title)
    .map((title: string, index) => {
      return {
        key: index + 1,
        label: title,
        props: {
          onClick: () => {
            router.push(`/learn/step-${index + 1}`)
          },
        },
      }
    })

  function go(step: number) {
    router.push(`/learn/step-${step}`)
  }

  return {
    total: menu.length,
    current,
    menu,
    go,
  }
})

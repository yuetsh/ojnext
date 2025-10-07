import { defineStore } from "pinia"
import { ScreenMode } from "utils/constants"

export const useScreenModeStore = defineStore("screenMode", () => {
  const { state: screenMode, next: switchScreenMode } = useCycleList(
    Object.values(ScreenMode),
    {
      initialValue: ScreenMode.both,
    },
  )

  // 计算属性
  const isBothMode = computed(() => screenMode.value === ScreenMode.both)
  const isCodeOnlyMode = computed(() => screenMode.value === ScreenMode.code)

  const shouldShowProblem = computed(
    () =>
      screenMode.value === ScreenMode.both ||
      screenMode.value === ScreenMode.problem,
  )

  function resetScreenMode() {
    screenMode.value = ScreenMode.both
  }

  return {
    screenMode,
    isBothMode,
    isCodeOnlyMode,
    shouldShowProblem,
    switchScreenMode,
    resetScreenMode,
  }
})

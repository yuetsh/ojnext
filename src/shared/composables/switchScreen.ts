import { ScreenMode } from "~/utils/constants"

export const { state: screenMode, next: switchScreenMode } = useCycleList(
  Object.values(ScreenMode),
  {
    initialValue: ScreenMode.both,
  },
)

export function resetScreenMode() {
  screenMode.value = ScreenMode.both
}

export const bothAndProblem = computed(
  () =>
    screenMode.value === ScreenMode.both ||
    screenMode.value === ScreenMode.problem,
)

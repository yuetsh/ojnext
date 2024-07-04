import { ScreenMode } from "~/utils/constants"

export const screenMode = ref(ScreenMode.both)

export const screenSwitchLabel = computed(() => {
  if (screenMode.value === ScreenMode.both) return "题目 | 自测"
  else if (screenMode.value === ScreenMode.problem) return "仅题目"
  return "仅自测"
})

export function switchScreenMode() {
  if (screenMode.value === ScreenMode.both) {
    screenMode.value = ScreenMode.problem
    return
  }
  screenMode.value += 1
}

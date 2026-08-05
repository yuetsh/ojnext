import { useStorage } from "@vueuse/core"
import { STORAGE_KEY } from "utils/constants"

export type TutorialType = "python" | "c"

// 模块级单例：学习页写入、导航栏读取，必须共用同一个响应式引用，
// 否则导航栏的链接不会随学习进度更新
const learnStep = useStorage<Record<TutorialType, number>>(
  STORAGE_KEY.LEARN_CURRENT_STEP,
  { python: 1, c: 1 },
)

export function useLearnProgress() {
  return { learnStep }
}

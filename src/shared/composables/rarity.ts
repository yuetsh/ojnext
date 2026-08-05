import { useDark } from "@vueuse/core"
import { computed } from "vue"
import { RARITY_TEXT_COLOR } from "utils/constants"

/**
 * 成就稀有度的文字配色，跟随明暗主题切换。
 * 两套色值都压到 4.5:1 以上，不然浅色模式下白金和黄金的小字看不清。
 * 边框和色块不用这个，直接用 RARITY_COLOR 的原色。
 */
export function useRarityColor() {
  const isDark = useDark()
  return computed(() =>
    isDark.value ? RARITY_TEXT_COLOR.dark : RARITY_TEXT_COLOR.light,
  )
}

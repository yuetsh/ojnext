import {
  breakpointsTailwind,
  useBreakpoints as useVueUseBreakpoints,
} from "@vueuse/core"

/**
 * 响应式断点检测 composable
 * 每次调用创建新的断点检测实例
 */
export function useBreakpoints() {
  const breakpoints = useVueUseBreakpoints(breakpointsTailwind)

  const isMobile = breakpoints.smallerOrEqual("md")
  const isDesktop = breakpoints.greater("md")

  return {
    isMobile,
    isDesktop,
  }
}

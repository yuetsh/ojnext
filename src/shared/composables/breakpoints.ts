import { breakpointsTailwind } from "@vueuse/core"

const breakpoints = useBreakpoints(breakpointsTailwind)

export const isMobile = breakpoints.smallerOrEqual("md")
export const isDesktop = breakpoints.greater("md")

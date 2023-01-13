import type * as Monaco from "monaco-editor"

declare module "element-plus/dist/locale/zh-cn.mjs"

declare module "*.md" {
  import type { ComponentOptions } from "vue"
  const Component: ComponentOptions
  export default Component
}

declare global {
  interface Window {
    monaco: Monaco
  }
}

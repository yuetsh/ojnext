declare module "*.md" {
  import type { ComponentOptions } from "vue"
  const Component: ComponentOptions
  export default Component
}

declare global {
  let monaco: Monaco
  interface Window {
    monaco: Monaco
  }
}

interface Window {
  monaco: Monaco
}

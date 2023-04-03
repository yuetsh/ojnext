import loader, { Monaco } from "@monaco-editor/loader"
import { isLowVersion, protocol } from "~/utils/functions"

export const monaco = ref<Monaco>()

export async function init() {
  const version = isLowVersion ? "0.30.1" : "0.36.1"
  loader.config({
    paths: {
      vs: `${protocol}://cdn.staticfile.org/monaco-editor/${version}/min/vs`,
    },
    "vs/nls": { availableLanguages: { "*": "zh-cn" } },
  })

  const [m, light, dark] = await Promise.all([
    loader.init(),
    fetch("/light.json").then((t) => t.json()),
    fetch("/dark.json").then((t) => t.json()),
  ])
  monaco.value = m
  monaco.value.editor.defineTheme("light", light)
  monaco.value.editor.defineTheme("dark", dark)
}

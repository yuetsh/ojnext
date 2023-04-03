import loader, { Monaco } from "@monaco-editor/loader"
import * as monaco0301 from "monaco-editor"
import { isLowVersion } from "~/utils/functions"

export const monaco = ref<Monaco>()

export async function init() {
  if (isLowVersion) {
    loader.config({ monaco: monaco0301 })
  } else {
    loader.config({
      paths: { vs: "https://cdn.staticfile.org/monaco-editor/0.36.1/min/vs" },
      "vs/nls": { availableLanguages: { "*": "zh-cn" } },
    })
  }

  const [m, light, dark] = await Promise.all([
    loader.init(),
    fetch("/light.json").then((t) => t.json()),
    fetch("/dark.json").then((t) => t.json()),
  ])
  monaco.value = m
  monaco.value.editor.defineTheme("light", light)
  monaco.value.editor.defineTheme("dark", dark)
}

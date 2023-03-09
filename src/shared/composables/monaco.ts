import loader, { Monaco } from "@monaco-editor/loader"

export const monaco = ref<Monaco>()

export async function init() {
  loader.config({
    paths: { vs: "https://cdn.staticfile.org/monaco-editor/0.36.1/min/vs" },
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

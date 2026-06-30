import hljs from "highlight.js/lib/core"
import python from "highlight.js/lib/languages/python"
import c from "highlight.js/lib/languages/c"

hljs.registerLanguage("python", python)
hljs.registerLanguage("c", c)

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function normalizeLang(lang?: string): "python" | "c" | null {
  return lang === "python" ? "python" : lang === "c" ? "c" : null
}

// 把整段代码高亮为 HTML；不支持的语言或异常时回退为转义文本
export function highlight(code: string, lang?: string): string {
  const language = normalizeLang(lang)
  if (language) {
    try {
      return hljs.highlight(code, { language }).value
    } catch {
      // fall through
    }
  }
  return escapeHtml(code)
}

// 按行高亮：整体高亮后再按行切分，保证跨行 token 着色正确，返回逐行 HTML 数组
export function highlightLines(lines: string[], lang?: string): string[] {
  const language = normalizeLang(lang)
  if (language) {
    try {
      const html = hljs.highlight(lines.join("\n"), { language }).value
      return html.split("\n")
    } catch {
      // fall through
    }
  }
  return lines.map((line) => escapeHtml(line))
}

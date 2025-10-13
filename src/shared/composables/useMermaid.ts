import { nanoid } from "nanoid"

export function useMermaid() {
  // 渲染状态
  const renderError = ref<string | null>(null)
  
  // 动态导入 mermaid
  let mermaid: any = null

  // 动态加载 Mermaid
  const loadMermaid = async () => {
    if (!mermaid) {
      const mermaidModule = await import("mermaid")
      mermaid = mermaidModule.default
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "loose",
        theme: "default",
      })
    }
    return mermaid
  }

  // 渲染流程图的函数
  const renderFlowchart = async (container: HTMLElement | null, mermaidCode: string) => {
    try {
      renderError.value = null

      // 确保 mermaid 已加载
      await loadMermaid()

      // 渲染流程图
      if (container && mermaidCode) {
        const id = `mermaid-${nanoid()}`
        const { svg } = await mermaid.render(id, mermaidCode)
        container.innerHTML = svg
      }
    } catch (error) {
      renderError.value =
        error instanceof Error ? error.message : "流程图渲染失败，请检查代码格式"
    }
  }

  // 清除渲染错误
  const clearError = () => {
    renderError.value = null
  }

  return {
    renderError: readonly(renderError),
    renderFlowchart,
    clearError,
  }
}

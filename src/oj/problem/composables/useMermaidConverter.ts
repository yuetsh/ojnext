/**
 * 将流程图JSON数据转换为Mermaid格式
 */
export function useMermaidConverter() {
  const convertToMermaid = (flowchartData: any) => {
    const { nodes, edges } = flowchartData

    if (!nodes || nodes.length === 0) {
      return "graph TD\n    A[空流程图]"
    }

    let mermaid = "graph TD\n"

    // 处理节点 - 根据原始类型和自定义标签
    nodes.forEach((node: any) => {
      const nodeId = node.id
      const label = node.data?.customLabel || node.data?.label || "节点"
      const originalType = node.data?.originalType || node.type

      // 根据节点原始类型确定Mermaid语法
      switch (originalType) {
        case "start":
          mermaid += `    ${nodeId}(("${label}"))\n`
          break
        case "end":
          mermaid += `    ${nodeId}(("${label}"))\n`
          break
        case "input":
          // 输入框使用平行四边形
          mermaid += `    ${nodeId}[/"${label}"/]\n`
          break
        case "output":
          // 输出框使用平行四边形
          mermaid += `    ${nodeId}[/"${label}"/]\n`
          break
        case "default":
          mermaid += `    ${nodeId}["${label}"]\n`
          break
        case "decision":
          mermaid += `    ${nodeId}{"${label}"}\n`
          break
        case "loop":
          // 循环使用菱形
          mermaid += `    ${nodeId}{"${label}"}\n`
          break
        default:
          mermaid += `    ${nodeId}["${label}"]\n`
      }
    })

    // 处理边
    edges.forEach((edge: any) => {
      const source = edge.source
      const target = edge.target
      const label = edge.label ?? ""

      if (label && label.trim() !== "") {
        mermaid += `    ${source} -->|"${label}"| ${target}\n`
      } else {
        mermaid += `    ${source} --> ${target}\n`
      }
    })

    // 添加样式定义来区分不同类型的节点
    mermaid += "\n"
    mermaid +=
      "    classDef startEnd fill:#e1f5fe,stroke:#01579b,stroke-width:2px\n"
    mermaid +=
      "    classDef input fill:#e3f2fd,stroke:#1976d2,stroke-width:2px\n"
    mermaid +=
      "    classDef output fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px\n"
    mermaid +=
      "    classDef process fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px\n"
    mermaid +=
      "    classDef decision fill:#fff3e0,stroke:#e65100,stroke-width:2px\n"
    mermaid += "\n"

    // 为节点应用样式
    nodes.forEach((node: any) => {
      const nodeId = node.id
      const originalType = node.data?.originalType || node.type

      switch (originalType) {
        case "start":
        case "end":
          mermaid += `    class ${nodeId} startEnd\n`
          break
        case "input":
          mermaid += `    class ${nodeId} input\n`
          break
        case "output":
          mermaid += `    class ${nodeId} output\n`
          break
        case "decision":
        case "loop":
          mermaid += `    class ${nodeId} decision\n`
          break
        default:
          mermaid += `    class ${nodeId} process\n`
      }
    })

    return mermaid
  }

  return {
    convertToMermaid,
  }
}

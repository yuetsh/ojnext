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

    // Build safe ID mapping to prevent Mermaid syntax errors from special characters
    const idMap = new Map<string, string>()
    nodes.forEach((node: any, index: number) => {
      idMap.set(node.id, `node_${index}`)
    })
    const safeId = (id: string) =>
      idMap.get(id) || id.replace(/[^a-zA-Z0-9_]/g, "_")

    // 处理节点 - 根据原始类型和自定义标签
    nodes.forEach((node: any) => {
      const nodeId = safeId(node.id)
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
      const source = safeId(edge.source)
      const target = safeId(edge.target)
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
      "    classDef startNode fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#0f172a\n"
    mermaid +=
      "    classDef endNode fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#0f172a\n"
    mermaid +=
      "    classDef input fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#0f172a\n"
    mermaid +=
      "    classDef output fill:#ede9fe,stroke:#7c3aed,stroke-width:2px,color:#0f172a\n"
    mermaid +=
      "    classDef process fill:#f0f9ff,stroke:#0284c7,stroke-width:2px,color:#0f172a\n"
    mermaid +=
      "    classDef decision fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#0f172a\n"
    mermaid +=
      "    classDef loop fill:#fae8ff,stroke:#c026d3,stroke-width:2px,color:#0f172a\n"
    mermaid += "\n"

    // 为节点应用样式
    nodes.forEach((node: any) => {
      const nodeId = safeId(node.id)
      const originalType = node.data?.originalType || node.type

      switch (originalType) {
        case "start":
          mermaid += `    class ${nodeId} startNode\n`
          break
        case "end":
          mermaid += `    class ${nodeId} endNode\n`
          break
        case "input":
          mermaid += `    class ${nodeId} input\n`
          break
        case "output":
          mermaid += `    class ${nodeId} output\n`
          break
        case "decision":
          mermaid += `    class ${nodeId} decision\n`
          break
        case "loop":
          mermaid += `    class ${nodeId} loop\n`
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

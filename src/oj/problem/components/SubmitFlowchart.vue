<script lang="ts" setup>
import { useBreakpoints } from "shared/composables/breakpoints"

const { isDesktop } = useBreakpoints()
const message = useMessage()

// 通过inject获取FlowchartEditor组件的引用
const flowchartEditorRef = inject<any>("flowchartEditorRef")

// 将流程图JSON数据转换为Mermaid格式
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
        mermaid += `    ${nodeId}[${label}]\n`
        break
      case "end":
        mermaid += `    ${nodeId}[${label}]\n`
        break
      case "input":
        mermaid += `    ${nodeId}[${label}]\n`
        break
      case "output":
        mermaid += `    ${nodeId}[${label}]\n`
        break
      case "default":
        mermaid += `    ${nodeId}[${label}]\n`
        break
      case "decision":
        mermaid += `    ${nodeId}{${label}}\n`
        break
      case "loop":
        mermaid += `    ${nodeId}[${label}]\n`
        break
      default:
        mermaid += `    ${nodeId}[${label}]\n`
    }
  })

  // 处理边
  edges.forEach((edge: any) => {
    const source = edge.source
    const target = edge.target
    const label = edge.label || edge.data?.label || ""

    if (label) {
      mermaid += `    ${source} -->|${label}| ${target}\n`
    } else {
      mermaid += `    ${source} --> ${target}\n`
    }
  })

  return mermaid
}

const submit = () => {
  if (!flowchartEditorRef?.value) return
  // 获取流程图的JSON数据
  const flowchartData = flowchartEditorRef.value.getFlowchartData()

  if (flowchartData.nodes.length === 0 || flowchartData.edges.length === 0) {
    message.error("流程图节点或边不能为空")
    return
  }

  // 打印JSON数据到控制台
  console.log("流程图JSON数据:", JSON.stringify(flowchartData, null, 2))

  // 转换为Mermaid格式
  const mermaidCode = convertToMermaid(flowchartData)
  console.log("Mermaid代码:")
  console.log(mermaidCode)

  // 显示成功消息
  message.success("敬请期待，快了～")
}
</script>

<template>
  <n-button
    :size="isDesktop ? 'medium' : 'small'"
    type="primary"
    @click="submit"
  >
    提交流程图
  </n-button>
</template>

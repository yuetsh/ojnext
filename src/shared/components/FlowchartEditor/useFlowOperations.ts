import type { Ref } from "vue"
import type { Node, Edge } from "@vue-flow/core"
import { getRandomId } from "utils/functions"

export function useFlowOperations(
  nodes: Ref<Node[]>,
  edges: Ref<Edge[]>,
  addNodes: (nodes: Node[]) => void,
  addEdges: (edges: Edge[]) => void,
  removeNodes: (nodeIds: string[]) => void,
  removeEdges: (edgeIds: string[]) => void,
  saveState: (nodes: Node[], edges: Edge[]) => void,
) {
  // 根据节点类型和handle自动推断标签
  const getAutoLabel = (
    sourceNode: any,
    targetNode: any,
    sourceHandle: string,
    targetHandle: string,
  ) => {
    const sourceType = sourceNode?.data?.originalType || sourceNode?.type
    const targetType = targetNode?.data?.originalType || targetNode?.type

    // 如果是判断节点
    if (sourceType === "decision") {
      // 根据handle ID推断标签
      if (sourceHandle === "yes") {
        return "是"
      } else if (sourceHandle === "no") {
        return "否"
      }
    }

    // 如果是循环节点
    if (sourceType === "loop") {
      // 根据handle ID推断标签
      if (sourceHandle === "continue") {
        return "继续"
      } else if (sourceHandle === "exit") {
        return "退出"
      }
    }

    // 如果是循环体回到循环节点
    if (targetType === "loop") {
      if (targetHandle === "return") {
        return "返回"
      }
    }
    // 默认情况
    return ""
  }

  // 连接处理
  const handleConnect = (params: any) => {
    // 获取源节点和目标节点
    const sourceNode = nodes.value.find((node) => node.id === params.source)
    const targetNode = nodes.value.find((node) => node.id === params.target)

    // 自动推断标签
    const autoLabel = getAutoLabel(
      sourceNode,
      targetNode,
      params.sourceHandle,
      params.targetHandle,
    )

    const newEdge: Edge = {
      id: `edge-${getRandomId()}`,
      source: params.source,
      target: params.target,
      sourceHandle: params.sourceHandle,
      targetHandle: params.targetHandle,
      type: "default",
      label: autoLabel,
    }

    addEdges([newEdge])
    saveState(nodes.value, edges.value)
  }

  // 边点击处理 - 单击删除
  const handleEdgeClick = (event: any) => {
    removeEdges([event.edge.id])
    saveState(nodes.value, edges.value)
  }

  // 节点删除
  const handleNodeDelete = (nodeId: string) => {
    // 删除相关边
    const relatedEdges = edges.value.filter(
      (edge) => edge.source === nodeId || edge.target === nodeId,
    )
    if (relatedEdges.length > 0) {
      removeEdges(relatedEdges.map((edge) => edge.id))
    }

    removeNodes([nodeId])
    saveState(nodes.value, edges.value)
  }

  // 节点更新
  const handleNodeUpdate = (nodeId: string, newLabel: string) => {
    const nodeIndex = nodes.value.findIndex((node) => node.id === nodeId)

    if (nodeIndex !== -1) {
      const oldNode = nodes.value[nodeIndex]

      // 创建新的节点对象以确保响应式更新
      const updatedNode = {
        ...oldNode,
        data: {
          ...oldNode.data,
          customLabel: newLabel,
        },
      }

      // 使用 Vue Flow 的更新方法
      nodes.value[nodeIndex] = updatedNode

      // 强制触发响应式更新
      nodes.value = [...nodes.value]

      saveState(nodes.value, edges.value)
    }
  }

  // 清空画布
  const clearCanvas = () => {
    nodes.value = []
    edges.value = []
    saveState(nodes.value, edges.value)
  }

  // 删除选中的节点和边
  const deleteSelected = () => {
    const selectedNodes = nodes.value.filter((node) => (node as any).selected)
    const selectedEdges = edges.value.filter((edge) => (edge as any).selected)

    if (selectedNodes.length > 0) {
      removeNodes(selectedNodes.map((node) => node.id))
    }
    if (selectedEdges.length > 0) {
      removeEdges(selectedEdges.map((edge) => edge.id))
    }
    saveState(nodes.value, edges.value)
  }

  return {
    handleConnect,
    handleEdgeClick,
    handleNodeDelete,
    handleNodeUpdate,
    clearCanvas,
    deleteSelected,
  }
}

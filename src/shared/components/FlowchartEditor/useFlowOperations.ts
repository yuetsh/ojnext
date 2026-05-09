import type { Ref } from "vue"
import type { Node, Edge, Connection } from "@vue-flow/core"
import { useVueFlow } from "@vue-flow/core"
import { getRandomId } from "utils/functions"

export function useFlowOperations(
  nodes: Ref<Node[]>,
  edges: Ref<Edge[]>,
  addEdges: (edges: Edge[]) => void,
  removeNodes: (nodeIds: string[]) => void,
  removeEdges: (edgeIds: string[]) => void,
  saveState: (nodes: Node[], edges: Edge[]) => void,
) {
  const { findNode, getSelectedNodes, getSelectedEdges } = useVueFlow()
  const getAutoLabel = (
    sourceNode: Node | undefined,
    targetNode: Node | undefined,
    sourceHandle: string | null | undefined,
    targetHandle: string | null | undefined,
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

  const handleConnect = (params: Connection) => {
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

  const handleEdgeClick = ({ edge }: { edge: Edge }) => {
    removeEdges([edge.id])
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

  // 节点更新，空标签时清除自定义标签（恢复默认类型名称）
  const handleNodeUpdate = (nodeId: string, newLabel: string) => {
    const node = findNode(nodeId)
    if (node) {
      if (newLabel) {
        node.data = { ...node.data, customLabel: newLabel }
      } else {
        const { customLabel: _, ...rest } = node.data
        node.data = rest
      }
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
    const selectedNodes = getSelectedNodes.value
    const selectedEdges = getSelectedEdges.value

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

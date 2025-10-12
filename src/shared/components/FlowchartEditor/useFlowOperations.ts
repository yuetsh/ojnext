import { nanoid } from "nanoid"
import type { Ref } from 'vue'
import type { Node, Edge } from '@vue-flow/core'

/**
 * 简化的流程操作
 */
export function useFlowOperations(
  nodes: Ref<Node[]>,
  edges: Ref<Edge[]>,
  addNodes: (nodes: Node[]) => void,
  addEdges: (edges: Edge[]) => void,
  removeNodes: (nodeIds: string[]) => void,
  removeEdges: (edgeIds: string[]) => void,
  saveState: (nodes: Node[], edges: Edge[]) => void
) {
  // 连接处理
  const handleConnect = (params: any) => {
    const newEdge: Edge = {
      id: `edge-${nanoid()}`,
      source: params.source,
      target: params.target,
      sourceHandle: params.sourceHandle,
      targetHandle: params.targetHandle,
      type: 'default'
    }
    
    addEdges([newEdge])
    saveState(nodes.value, edges.value)
  }

  // 边点击删除
  const handleEdgeClick = (event: any) => {
    removeEdges([event.edge.id])
    saveState(nodes.value, edges.value)
  }

  // 节点删除
  const handleNodeDelete = (nodeId: string) => {
    // 删除相关边
    const relatedEdges = edges.value.filter(edge => 
      edge.source === nodeId || edge.target === nodeId
    )
    if (relatedEdges.length > 0) {
      removeEdges(relatedEdges.map(edge => edge.id))
    }
    
    removeNodes([nodeId])
    saveState(nodes.value, edges.value)
  }

  // 节点更新
  const handleNodeUpdate = (nodeId: string, newLabel: string) => {
    const nodeIndex = nodes.value.findIndex(node => node.id === nodeId)
    
    if (nodeIndex !== -1) {
      const oldNode = nodes.value[nodeIndex]
      
      // 创建新的节点对象以确保响应式更新
      const updatedNode = {
        ...oldNode,
        data: {
          ...oldNode.data,
          customLabel: newLabel
        }
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
    const selectedNodes = nodes.value.filter(node => (node as any).selected)
    const selectedEdges = edges.value.filter(edge => (edge as any).selected)
    
    if (selectedNodes.length > 0) {
      removeNodes(selectedNodes.map(node => node.id))
    }
    if (selectedEdges.length > 0) {
      removeEdges(selectedEdges.map(edge => edge.id))
    }
    saveState(nodes.value, edges.value)
  }

  return {
    handleConnect,
    handleEdgeClick,
    handleNodeDelete,
    handleNodeUpdate,
    clearCanvas,
    deleteSelected
  }
}

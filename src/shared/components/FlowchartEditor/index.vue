<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Toolbar from "./Toolbar.vue"
import "@vue-flow/core/dist/style.css"
import "@vue-flow/core/dist/theme-default.css"
import "@vue-flow/controls/dist/style.css"
import { useVueFlow, VueFlow, type Node, type Edge, MarkerType } from "@vue-flow/core"
import { Controls } from "@vue-flow/controls"
import { Background } from "@vue-flow/background"

import { useDnD } from "./useDnD"
import { useHistory } from "./useHistory"
import { useFlowOperations } from "./useFlowOperations"
import { useCache } from "./useCache"
import CustomNode from "./CustomNode.vue"

// Vue Flow 实例
const { addNodes, addEdges, removeNodes, removeEdges } = useVueFlow()

// 节点和边的响应式数据
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

// 历史记录管理
const { canUndo, canRedo, saveState, undo, redo } = useHistory()

// 缓存管理
const { isSaving, lastSaved, hasUnsavedChanges, saveToCache, loadFromCache, clearCache } = useCache(
  nodes,
  edges,
  'flowchart-editor-data'
)

// 拖拽处理
const { isDragOver, onDragOver, onDragLeave, onDrop } = useDnD()

// 流程操作
const {
  handleConnect,
  handleEdgeClick,
  handleNodeDelete,
  handleNodeUpdate,
  clearCanvas,
  deleteSelected
} = useFlowOperations(
  nodes,
  edges,
  addNodes,
  addEdges,
  removeNodes,
  removeEdges,
  saveState
)

// 拖拽处理包装
const handleDragOver = (event: DragEvent) => {
  onDragOver(event)
}

const handleDragLeave = () => {
  onDragLeave()
}

const handleDrop = (event: DragEvent) => {
  // 处理正常的节点创建拖拽
  const newNode = onDrop(event)
  if (newNode) {
    saveState(nodes.value, edges.value)
  }
}

// 撤销/重做处理
const handleUndo = () => {
  const state = undo()
  if (state) {
    nodes.value = [...state.nodes]
    edges.value = [...state.edges]
  }
}

const handleRedo = () => {
  const state = redo()
  if (state) {
    nodes.value = [...state.nodes]
    edges.value = [...state.edges]
  }
}

// 清空画布
const handleClear = () => {
  clearCanvas()
  clearCache()
}

// 键盘事件
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.target instanceof HTMLInputElement) return

  if (event.key === 'Delete' || event.key === 'Backspace') {
    deleteSelected()
  }

  if (event.ctrlKey || event.metaKey) {
    if (event.key === 'z' && !event.shiftKey) {
      event.preventDefault()
      handleUndo()
    } else if (event.key === 'z' && event.shiftKey) {
      event.preventDefault()
      handleRedo()
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  
  // 从缓存恢复数据
  loadFromCache()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})

// 加载外部数据到编辑器
const setFlowchartData = (data: { nodes: Node[], edges: Edge[] }) => {
  if (data && data.nodes && data.edges) {
    // 确保节点数据包含必要的位置信息
    const processedNodes = data.nodes.map(node => ({
      ...node,
      position: node.position || { x: 0, y: 0 }
    }))
    
    // 确保边数据包含必要的 handle 信息
    const processedEdges = data.edges.map(edge => ({
      ...edge,
      sourceHandle: edge.sourceHandle || null,
      targetHandle: edge.targetHandle || null
    }))
    
    nodes.value = processedNodes
    edges.value = processedEdges
    saveState(nodes.value, edges.value)
  }
}

// 暴露节点和边数据给父组件
defineExpose({
  nodes,
  edges,
  getFlowchartData: () => ({
    nodes: nodes.value,
    edges: edges.value
  }),
  setFlowchartData
})
</script>

<template>
  <div class="container">
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @connect="handleConnect"
      @edge-click="handleEdgeClick"
      :default-edge-options="{
        type: 'step',
        style: { 
          stroke: '#6366f1', 
          strokeWidth: 2.5, 
          cursor: 'pointer',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#6366f1',
          width: 16,
          height: 16,
        },
      }"
      :connection-line-style="{
        stroke: '#6366f1',
        strokeWidth: 2.5,
        strokeDasharray: '8,4',
        markerEnd: 'url(#connection-arrow)',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
      }"
      :fit-view-on-init="false"
      :connect-on-click="false"
      :multi-selection-key-code="null"
      :delete-key-code="null"
    >
      <!-- SVG 定义用于连接线箭头 -->
      <defs>
        <marker
          id="connection-arrow"
          markerWidth="12"
          markerHeight="12"
          refX="10"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L10,3 z" fill="#6366f1" stroke="#6366f1" strokeWidth="0.5" />
        </marker>
      </defs>
      <template #node-custom="{ data, id, type }">
        <CustomNode
          :id="id"
          :type="type"
          :data="data"
          @delete="handleNodeDelete"
          @update="handleNodeUpdate"
        />
      </template>

      <Background variant="lines" :gap="20" :size="1" />
      <Controls />
      <Toolbar
        :can-undo="canUndo"
        :can-redo="canRedo"
        :is-saving="isSaving"
        :last-saved="lastSaved"
        :has-unsaved-changes="hasUnsavedChanges"
        @clear="handleClear"
        @undo="handleUndo"
        @redo="handleRedo"
        @deleteNode="handleNodeDelete"
      />
    </VueFlow>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  height: calc(100vh - 133px);
  position: relative;
}
</style>


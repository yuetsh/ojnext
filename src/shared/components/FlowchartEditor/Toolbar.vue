<script setup lang="ts">
import { computed } from 'vue'
import { getNodeTypeConfig } from './useNodeStyles'

// 拖拽开始处理
const onDragStart = (event: DragEvent, type: string) => {
  if (!event.dataTransfer || !type) return
  
  event.dataTransfer.setData("application/vueflow", type)
  event.dataTransfer.effectAllowed = "move"
}

// Props
const props = defineProps<{
  canUndo?: boolean
  canRedo?: boolean
  isSaving?: boolean
  lastSaved?: Date | null
  hasUnsavedChanges?: boolean
}>()

// Emits
const emit = defineEmits<{
  deleteNode: [nodeId: string]
  undo: []
  redo: []
  clear: []
}>()

// 工具栏状态

// 节点类型定义 - 优化性能
const nodeTypes = computed(() => [
  'start',
  'input', 
  'default',
  'decision',
  'loop',
  'output',
  'end'
].map(type => {
  const config = getNodeTypeConfig(type)
  return {
    type,
    ...config
  }
}))

// 获取保存状态标题
const getSaveStatusTitle = () => {
  if (props.isSaving) {
    return '正在保存...'
  } else if (props.hasUnsavedChanges) {
    return '有未保存的更改'
  } else if (props.lastSaved) {
    return `已保存 - ${new Date(props.lastSaved).toLocaleTimeString()}`
  } else {
    return '已保存'
  }
}


</script>
<template>
  <div class="toolbar">
    <!-- 工具栏头部 -->
    <div class="toolbar-header">
      <div class="header-content">
        <h3>节点库</h3>
        <div class="save-status-indicator" :class="{ 
          'saving': props.isSaving, 
          'unsaved': props.hasUnsavedChanges && !props.isSaving,
          'saved': !props.hasUnsavedChanges && !props.isSaving 
        }" :title="getSaveStatusTitle()">
          <span v-if="props.isSaving" class="spinner">⏳</span>
          <span v-else-if="props.hasUnsavedChanges">●</span>
          <span v-else>✔</span>
        </div>
      </div>
      <p class="description">拖拽节点到画布中</p>
    </div>


    <!-- 节点列表 -->
    <div class="nodes">
      <div
        v-for="nodeType in nodeTypes"
        :key="nodeType.type"
        class="node-item"
        :draggable="true"
        @dragstart="onDragStart($event, nodeType.type)"
        :style="{ borderColor: nodeType.color }"
        :title="`${nodeType.label} - ${nodeType.description}`"
      >
        <div class="node-icon" :style="{ backgroundColor: nodeType.color }">
          {{ nodeType.icon }}
        </div>
        <div class="node-info">
          <div class="node-label">{{ nodeType.label }}</div>
          <div class="node-description">{{ nodeType.description }}</div>
        </div>
      </div>
    </div>

    <!-- 工具栏操作 -->
    <div class="toolbar-actions">
      <div class="history-controls">
        <button 
          class="action-btn history-btn" 
          :disabled="!canUndo"
          @click="$emit('undo')"
          title="撤销 (Ctrl+Z)"
        >
          <span class="btn-icon">↶</span>
          <span class="btn-text">撤销</span>
        </button>
        <button 
          class="action-btn history-btn" 
          :disabled="!canRedo"
          @click="$emit('redo')"
          title="重做 (Ctrl+Y)"
        >
          <span class="btn-icon">↷</span>
          <span class="btn-text">重做</span>
        </button>
      </div>
      <button class="action-btn clear-btn" @click="$emit('clear')" title="清空画布">
        <span class="btn-icon">🗑️</span>
        <span class="btn-text">清空画布</span>
      </button>
    </div>

  </div>
</template>

<style scoped>
.toolbar {
  width: 140px;
  height: auto;
  max-height: calc(100vh - 40px);
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 16px;
  overflow-y: auto;
  transition: all 0.3s ease;
}


.toolbar-header {
  margin-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 12px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.toolbar-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

/* 保存状态指示器样式 */
.save-status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.3s ease;
  cursor: pointer;
}

.save-status-indicator.saving {
  background: #fef3c7;
  color: #d97706;
  animation: pulse 1.5s ease-in-out infinite;
}

.save-status-indicator.unsaved {
  background: #fef2f2;
  color: #dc2626;
  animation: pulse 1.5s ease-in-out infinite;
}

.save-status-indicator.saved {
  background: #f0fdf4;
  color: #16a34a;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}


.description {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}


/* 节点列表样式 */
.nodes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.node-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s ease;
  background: white;
}

.node-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  transform: translateY(-2px);
}

.node-item:active {
  cursor: grabbing;
  transform: translateY(0);
}

.node-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  margin-right: 10px;
  flex-shrink: 0;
}

.node-info {
  flex: 1;
  min-width: 0;
}

.node-label {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
  font-size: 14px;
}

.node-description {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.3;
}


/* 工具栏操作按钮样式 */
.toolbar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid #e5e7eb;
  padding-top: 12px;
}

.history-controls {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 6px;
}

.action-btn:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-1px);
}

.action-btn:active {
  background: #f3f4f6;
  transform: translateY(0);
}

.history-btn {
  flex: 1;
  font-size: 11px;
  padding: 8px 10px;
}

.history-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f9fafb;
  color: #9ca3af;
}

.history-btn:disabled:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  transform: none;
}

.clear-btn {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.clear-btn:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

.btn-icon {
  font-size: 14px;
}

.btn-text {
  font-size: 12px;
}


/* 滚动条样式 */
.toolbar::-webkit-scrollbar {
  width: 6px;
}

.toolbar::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.toolbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.toolbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}


/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    width: 180px;
    top: 10px;
    left: 10px;
  }
}
</style>

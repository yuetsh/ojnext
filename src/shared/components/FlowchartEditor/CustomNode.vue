<template>
  <div
    class="custom-node"
    :class="{
      'is-hovered': isHovered,
      'is-editing': isEditing,
      readonly: readonly,
    }"
    :data-node-type="nodeType"
    :draggable="!isEditing && !readonly"
    @mouseenter="!readonly ? (isHovered = true) : undefined"
    @mouseleave="!readonly ? handleMouseLeave : undefined"
    @dblclick="!readonly ? handleDoubleClick : undefined"
    @dragstart="!readonly ? handleDragStart : undefined"
    @mousedown="!readonly ? handleMouseDown : undefined"
  >
    <!-- 连线点 - 根据节点类型动态显示 -->
    <NodeHandles :node-type="nodeType" :node-config="nodeConfig" />

    <!-- 节点内容 -->
    <div class="node-content">
      <!-- 显示模式 -->
      <span v-if="!isEditing" class="node-label">{{ displayLabel }}</span>

      <!-- 编辑模式 -->
      <input
        v-if="isEditing"
        ref="editInput"
        v-model="editText"
        class="node-input"
        @blur="handleSaveEdit"
        @keydown.enter="handleSaveEdit"
        @keydown.escape="handleCancelEdit"
        @click.stop
        @focusout="handleSaveEdit"
      />

      <!-- 隐藏的文字用于保持尺寸 -->
      <span v-if="isEditing" class="node-label-hidden" aria-hidden="true">
        {{ displayLabel }}
      </span>
    </div>

    <!-- 悬停时显示的操作按钮 -->
    <NodeActions
      v-if="isHovered && !readonly"
      @delete="handleDelete"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, onUnmounted, nextTick, computed, watch } from "vue"
import { getNodeTypeConfig } from "./useNodeStyles"
import NodeHandles from "./NodeHandles.vue"
import NodeActions from "./NodeActions.vue"

// 类型定义
interface Props {
  id: string
  type: string
  data: any
  readonly?: boolean
}

interface Emits {
  delete: [nodeId: string]
  update: [nodeId: string, newLabel: string]
}

// Props 和 Emits
const props = withDefaults(defineProps<Props>(), {
  readonly: false,
})
const emit = defineEmits<Emits>()

// 响应式状态
const isHovered = ref(false)
const isEditing = ref(false)
const editText = ref("")
const editInput = ref<HTMLInputElement>()

// 定时器和事件处理器
let hideTimeout: ReturnType<typeof setTimeout> | null = null
let globalClickHandler: ((event: MouseEvent) => void) | null = null

// 计算属性
const nodeType = computed(() => props.data.originalType || props.type)
const nodeConfig = computed(() => getNodeTypeConfig(nodeType.value))
const displayLabel = computed(
  () => props.data.customLabel || nodeConfig.value.label,
)

// 事件处理器
const handleDelete = () => emit("delete", props.id)

const handleMouseDown = (event: MouseEvent) => {
  // 检查是否点击在连线点区域
  const target = event.target as HTMLElement
  if (target.closest(".vue-flow__handle")) {
    // 如果在连线点区域，禁用节点拖拽
    event.preventDefault()
    return false
  }
}

const handleDragStart = (event: DragEvent) => {
  if (isEditing.value) {
    return
  }

  // 检查是否在连线点区域开始拖拽
  const target = event.target as HTMLElement
  if (target.closest(".vue-flow__handle")) {
    event.preventDefault()
    return false
  }

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move"
  }
}

const handleDoubleClick = (event: MouseEvent) => {
  event.stopPropagation()
  if (!isEditing.value) {
    isEditing.value = true
    editText.value = displayLabel.value
    nextTick(() => {
      editInput.value?.focus()
      editInput.value?.select()
    })
    addGlobalClickHandler()
  }
}

const handleSaveEdit = () => {
  if (isEditing.value) {
    // 保存编辑的文本
    if (editText.value.trim()) {
      emit("update", props.id, editText.value.trim())
    }
    isEditing.value = false
    removeGlobalClickHandler()
  }
}

const handleCancelEdit = () => {
  isEditing.value = false
  editText.value = ""
  removeGlobalClickHandler()
}

const handleMouseEnter = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
}

const handleMouseLeave = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
  }
  hideTimeout = setTimeout(() => {
    isHovered.value = false
  }, 300)
}

// 全局点击处理器
const addGlobalClickHandler = () => {
  if (globalClickHandler) return

  globalClickHandler = (event: MouseEvent) => {
    if (
      isEditing.value &&
      !(event.target as Element)?.closest(".custom-node")
    ) {
      handleSaveEdit()
    }
  }
  document.addEventListener("click", globalClickHandler, { capture: true })
}

const removeGlobalClickHandler = () => {
  if (globalClickHandler) {
    document.removeEventListener("click", globalClickHandler, { capture: true })
    globalClickHandler = null
  }
}

// 清理函数
onUnmounted(() => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
  }
  removeGlobalClickHandler()
})
</script>

<style scoped>
/* 主容器 */
.custom-node {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: inherit;
  transition: all 0.2s ease;
  padding: 0 20px;
}

.custom-node.is-hovered {
  z-index: 1;
}

.custom-node.is-hovered .node-content {
  filter: brightness(1.1);
}

.custom-node.readonly {
  cursor: default;
  pointer-events: none;
}

.custom-node.readonly .node-content {
  pointer-events: auto;
}

/* 节点内容区域 */
.node-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  transition: all 0.2s ease;
}

/* 节点标签 */
.node-label {
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
  display: inline-block;
  text-align: center;
  line-height: 1.2;
}

/* 编辑输入框 */
.node-input {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  border: none;
  outline: none;
  font-size: 16px;
  font-weight: 500;
  color: inherit;
  text-align: center;
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  resize: none;
  font-family: inherit;
  line-height: 1.2;
}

/* 隐藏标签（用于保持尺寸） */
.node-label-hidden {
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
  display: inline-block;
  visibility: hidden;
  pointer-events: none;
  text-align: center;
  line-height: 1.2;
}
</style>

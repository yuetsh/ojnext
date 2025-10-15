import { ref } from "vue"
import { useVueFlow } from "@vue-flow/core"
import {
  getNodeTypeConfig,
  createNodeStyle,
  getNodeDimensions,
} from "./useNodeStyles"
import { getRandomId } from "utils/functions"

/**
 * 简化的拖拽处理
 */
export function useDnD() {
  const { addNodes, screenToFlowCoordinate } = useVueFlow()
  const isDragOver = ref(false)

  // 拖拽悬停处理
  const onDragOver = (event: DragEvent) => {
    event.preventDefault()
    isDragOver.value = true
  }

  // 拖拽离开处理
  const onDragLeave = () => {
    isDragOver.value = false
  }

  // 拖拽放置处理
  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    isDragOver.value = false

    const type = event.dataTransfer?.getData("application/vueflow")
    if (!type) return

    // 获取鼠标在画布中的坐标
    const position = screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY,
    })

    // 根据节点类型获取实际尺寸
    const dimensions = getNodeDimensions(type)

    // 调整位置，使节点中心点对齐到鼠标位置
    const adjustedPosition = {
      x: position.x - dimensions.width / 2,
      y: position.y - dimensions.height / 2,
    }

    const nodeId = `node-${getRandomId()}`
    const config = getNodeTypeConfig(type)
    const newNode = {
      id: nodeId,
      type: "custom",
      position: adjustedPosition,
      data: {
        label: config.label,
        color: config.color,
        originalType: type,
      },
      style: createNodeStyle(type),
    }

    addNodes([newNode])
    return newNode
  }

  return {
    isDragOver,
    onDragOver,
    onDragLeave,
    onDrop,
  }
}

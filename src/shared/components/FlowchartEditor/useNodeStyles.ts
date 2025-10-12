/**
 * 节点样式管理
 */

/**
 * 获取节点类型配置
 */
export function getNodeTypeConfig(type: string) {
  const configs: Record<
    string,
    { label: string; color: string; icon: string; description: string }
  > = {
    start: {
      label: "开始",
      color: "#10b981",
      icon: "▶",
      description: "流程开始",
    },
    input: {
      label: "输入",
      color: "#06b6d4",
      icon: "📥",
      description: "数据输入",
    },
    default: {
      label: "赋值",
      color: "#3b82f6",
      icon: "⚙",
      description: "赋值语句",
    },
    decision: {
      label: "判断",
      color: "#f59e0b",
      icon: "❓",
      description: "条件语句",
    },
    loop: {
      label: "循环",
      color: "#8b5cf6",
      icon: "🔄",
      description: "循环语句",
    },
    output: {
      label: "输出",
      color: "#84cc16",
      icon: "📤",
      description: "数据输出",
    },
    end: {
      label: "结束",
      color: "#ef4444",
      icon: "⏹",
      description: "流程结束",
    },
  }
  return (
    configs[type] || {
      label: "节点",
      color: "#6b7280",
      icon: "⚪",
      description: "未知节点",
    }
  )
}

/**
 * 获取节点样式
 */
export function getNodeStyle(type: string, color: string) {
  const baseStyle = {
    background: color,
    color: "white",
    border: `2px solid ${color}`,
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "500",
    width: "auto", // 自动宽度
    height: "auto", // 自动高度
    minWidth: "100px",
    minHeight: "40px",
    maxWidth: "400px",
    maxHeight: "160px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  }

  // 根据节点类型调整样式
  switch (type) {
    case "start":
    case "end":
      return {
        ...baseStyle,
      }
    case "decision":
      return {
        ...baseStyle,
        borderRadius: "8px",
        minWidth: "140px",
        minHeight: "50px",
      }
    case "loop":
      return {
        ...baseStyle,
        borderRadius: "8px",
        minWidth: "140px",
        minHeight: "50px",
      }
    default:
      return baseStyle
  }
}

/**
 * 创建节点样式
 */
export function createNodeStyle(type: string) {
  const config = getNodeTypeConfig(type)
  return getNodeStyle(type, config.color)
}

/**
 * 获取节点尺寸
 */
export function getNodeDimensions(type: string) {
  switch (type) {
    case "start":
    case "end":
      return { width: 100, height: 40 }
    case "decision":
    case "loop":
      return { width: 140, height: 50 }
    default:
      return { width: 120, height: 40 }
  }
}

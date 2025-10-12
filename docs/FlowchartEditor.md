# FlowchartEditor 流程图编辑器

一个基于 Vue 3 + Vue Flow 构建的功能完整的流程图编辑器组件。

## 功能特性

### 🎯 核心功能
- **拖拽创建节点** - 从工具栏拖拽节点到画布
- **节点连接** - 支持节点间的连线操作
- **节点编辑** - 双击节点进行文本编辑
- **撤销重做** - 完整的历史记录管理
- **自动保存** - 本地缓存，防止数据丢失
- **键盘快捷键** - 支持常用快捷键操作

### 🎨 节点类型
- **开始节点** (start) - 流程开始
- **输入节点** (input) - 数据输入
- **处理节点** (default) - 数据处理
- **判断节点** (decision) - 条件判断
- **循环节点** (loop) - 循环处理
- **输出节点** (output) - 数据输出
- **结束节点** (end) - 流程结束

### ⌨️ 快捷键
- `Ctrl+Z` / `Cmd+Z` - 撤销
- `Ctrl+Y` / `Cmd+Shift+Z` - 重做
- `Delete` / `Backspace` - 删除选中节点

## 组件结构

```
FlowchartEditor/
├── index.vue              # 主组件
├── CustomNode.vue         # 自定义节点组件
├── Toolbar.vue            # 工具栏组件
├── NodeHandles.vue        # 节点操作手柄
├── NodeActions.vue        # 节点动作按钮
├── useCache.ts            # 缓存管理
├── useDnD.ts              # 拖拽处理
├── useFlowOperations.ts   # 流程操作
├── useHistory.ts          # 历史记录
└── useNodeStyles.ts       # 节点样式
```

## 使用方法

### 基本用法

```vue
<template>
  <FlowchartEditor ref="flowchartRef" />
</template>

<script setup>
import { ref } from 'vue'
import FlowchartEditor from '@/shared/components/FlowchartEditor/index.vue'

const flowchartRef = ref()

// 获取流程图数据
const getFlowchartData = () => {
  return flowchartRef.value?.getFlowchartData()
}
</script>
```

### 获取流程图数据

```javascript
// 获取当前流程图数据
const data = flowchartRef.value.getFlowchartData()
console.log(data.nodes)  // 节点数组
console.log(data.edges)  // 边数组
```

## 组件详解

### 主组件 (index.vue)

主组件负责整合所有功能模块，提供完整的流程图编辑体验。

**主要功能**：
- 整合 Vue Flow 核心功能
- 管理节点和边的状态
- 处理用户交互事件
- 提供数据暴露接口

**暴露的方法**：
- `getFlowchartData()` - 获取当前流程图数据

### 自定义节点 (CustomNode.vue)

基于 Vue Flow 的自定义节点组件，支持多种节点类型。

**节点类型配置**：
- 每种节点类型都有独特的样式和图标
- 支持自定义标签文本
- 提供删除和编辑功能

### 工具栏 (Toolbar.vue)

提供节点创建和操作的工具集合。

**功能**：
- 节点类型选择
- 撤销/重做操作
- 清空画布
- 保存状态显示

### 缓存管理 (useCache.ts)

提供本地存储功能，防止数据丢失。

**功能**：
- 自动保存到 localStorage
- 页面刷新后恢复数据
- 保存状态提示
- 清空缓存功能

### 拖拽处理 (useDnD.ts)

处理节点拖拽创建的逻辑。

**功能**：
- 拖拽开始处理
- 拖拽悬停效果
- 拖拽放置处理
- 节点位置计算

### 流程操作 (useFlowOperations.ts)

处理流程图的增删改操作。

**功能**：
- 节点连接处理
- 边删除处理
- 节点删除处理
- 节点更新处理
- 清空画布

### 历史记录 (useHistory.ts)

提供撤销重做功能。

**功能**：
- 状态快照保存
- 撤销操作
- 重做操作
- 历史记录管理

### 节点样式 (useNodeStyles.ts)

定义各种节点类型的样式配置。

**功能**：
- 节点类型配置
- 样式定义
- 图标配置
- 颜色主题

## 样式定制

### 节点样式

可以通过修改 `useNodeStyles.ts` 来自定义节点样式：

```typescript
export function getNodeTypeConfig(type: string) {
  const configs = {
    start: {
      label: '开始',
      icon: 'play-circle',
      color: '#10b981',
      // 自定义样式
    },
    // 其他节点类型...
  }
  
  return configs[type] || configs.default
}
```

### 边样式

边的样式在主组件中定义：

```vue
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
```

## 数据格式

### 节点数据格式

```typescript
interface Node {
  id: string
  type: string
  position: { x: number, y: number }
  data: {
    customLabel: string
    [key: string]: any
  }
}
```

### 边数据格式

```typescript
interface Edge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  type?: string
}
```

## 最佳实践

### 1. 性能优化
- 大量节点时考虑虚拟化
- 合理使用缓存机制
- 避免频繁的状态更新

### 2. 用户体验
- 提供清晰的操作反馈
- 支持键盘快捷键
- 保持操作的直观性

### 3. 数据管理
- 定期保存到服务器
- 提供数据导入导出功能
- 支持版本控制机制

## 扩展开发

### 添加新节点类型

1. 在 `useNodeStyles.ts` 中添加新类型配置
2. 在 `Toolbar.vue` 中添加新节点按钮
3. 在 `CustomNode.vue` 中添加新节点渲染逻辑

### 添加新功能

1. 创建新的 composable 函数
2. 在主组件中集成新功能
3. 更新工具栏和用户界面

## 故障排除

### 常见问题

1. **节点无法拖拽**
   - 检查拖拽事件处理
   - 确认节点类型配置正确

2. **撤销重做不工作**
   - 检查历史记录状态
   - 确认状态保存时机

3. **数据丢失**
   - 检查缓存配置
   - 确认 localStorage 可用

### 调试技巧

1. 使用 Vue DevTools 查看组件状态
2. 检查浏览器控制台错误
3. 验证数据格式正确性

## 更新日志

### v1.0.0 (2024-01-15)
- ✨ 初始版本发布
- 🎯 基础流程图编辑功能
- 🔧 拖拽创建节点
- 🔗 节点连接功能
- ↩️ 撤销重做支持
- 💾 本地缓存功能

### v1.1.0 (2024-01-20)
- 🎨 新增多种节点类型
- ⌨️ 键盘快捷键支持
- 🖱️ 优化拖拽体验
- 📱 响应式布局改进

### v1.2.0 (2024-01-25)
- 🔧 模块化重构
- 📦 组合式函数优化
- 🎯 性能提升
- 🐛 修复已知问题

## 许可证

MIT License

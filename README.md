# OJ Next

基于 Vue 3 + TypeScript 的在线判题系统前端项目。

## 项目特性

- 🎯 **现代化技术栈** - Vue 3 + TypeScript + Vite
- 📊 **数据可视化** - 丰富的图表和统计功能
- 🎨 **流程图编辑器** - 内置 FlowchartEditor 组件
- 📱 **响应式设计** - 支持多端适配
- ⚡ **高性能** - 优化的组件和状态管理

## 核心组件

### FlowchartEditor 流程图编辑器

一个功能完整的流程图编辑器组件，支持：

- 🎯 **拖拽创建节点** - 从工具栏拖拽节点到画布
- 🔗 **节点连接** - 支持节点间的连线操作
- ✏️ **节点编辑** - 双击节点进行文本编辑
- 📋 **节点操作** - 复制、删除、批量操作
- ↩️ **撤销重做** - 完整的历史记录管理
- ⌨️ **键盘快捷键** - Ctrl+Z/Ctrl+Y 撤销重做，Delete 删除
- 💾 **自动保存** - 本地缓存，防止数据丢失
- 🎨 **多种节点类型** - 开始、输入、处理、判断、循环、输出、结束
- 🖱️ **交互优化** - 流畅的拖拽体验和视觉反馈

**核心特性**：
- 基于 Vue Flow 构建，性能优异
- 模块化设计，易于扩展
- 响应式布局，支持多端适配
- 完整的 TypeScript 支持

详细文档：[FlowchartEditor 文档](./docs/FlowchartEditor.md)

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - JavaScript 的超集
- **Rsbuild** - 基于 Rspack 的构建工具
- **Vue Flow** - 流程图组件库
- **Composition API** - Vue 3 组合式 API
- **Naive UI** - Vue 3 组件库
- **Chart.js** - 图表可视化库
- **CodeMirror** - 代码编辑器
- **Yjs** - 实时协作框架

## 项目结构

```
src/
├── shared/                 # 共享组件和工具
│   ├── components/
│   │   └── FlowchartEditor/ # 流程图编辑器
│   │       ├── index.vue           # 主组件
│   │       ├── CustomNode.vue       # 自定义节点
│   │       ├── Toolbar.vue          # 工具栏
│   │       ├── NodeHandles.vue      # 节点操作
│   │       ├── NodeActions.vue      # 节点动作
│   │       ├── useCache.ts          # 缓存管理
│   │       ├── useDnD.ts            # 拖拽处理
│   │       ├── useFlowOperations.ts # 流程操作
│   │       ├── useHistory.ts        # 历史记录
│   │       └── useNodeStyles.ts     # 节点样式
│   ├── composables/        # 组合式函数
│   ├── layout/             # 布局组件
│   ├── store/              # 状态管理
│   └── themes/              # 主题配置
├── oj/                     # 主要业务组件
│   ├── ai/                 # AI分析模块
│   ├── problem/            # 题目相关
│   ├── contest/            # 竞赛相关
│   ├── submission/         # 提交相关
│   └── store/              # 业务状态管理
├── admin/                  # 管理后台组件
└── utils/                  # 工具函数
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
# 或
npm run start
```

### 构建生产版本

```bash
npm run build
```

### 构建测试环境版本

```bash
npm run build:test
```

### 构建预发布版本

```bash
npm run build:staging
```

## 文档

- [FlowchartEditor 流程图编辑器](./docs/FlowchartEditor.md)
- [图表组件说明](./docs/图表.md)
- [API 接口对比分析](./docs/API接口对比分析.md)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
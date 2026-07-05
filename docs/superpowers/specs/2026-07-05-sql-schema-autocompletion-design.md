# SQL 题目表名/字段名自动补全 — 设计

日期：2026-07-05

## 目标

学生在 SQL 题目的代码编辑器里输入时，自动补全列表中除现有的 SQL 关键字/函数外，还出现**当前题目的表名和字段名**（带类型提示），减少抄写表名字段名的负担和拼写错误。

## 背景

- SQL 题目详情页已下发 `problem.sql_display`（`SQLDisplay` 类型），其中 `tables: SQLDisplayTable[]` 包含每张表的 `name`、`columns[{name, type}]`。数据在前端齐全，**无需后端改动**。
- 编辑器补全入口是 `shared/extensions/autocompletion.ts` 的 `enhanceCompletion(language)`，`CodeEditor.vue` 和 `SyncCodeEditor.vue` 都用它，且都叠加了 `completeAnyWord`。
- SQL 静态关键字补全表在 `shared/extensions/sql.ts`。
- `shared` 直接 import `oj/store/problem` 已有先例（`FlowchartEditor/index.vue`）。

## 方案（已选：方案 A）

在 `enhanceCompletion` 中，当 `language === "SQL"` 时，从 `useProblemStore().problem?.sql_display?.tables` 动态生成补全项，追加到静态关键字列表后：

- **表名**：`type: "class"`，`detail: "数据表"`，`info` 列出该表全部字段（如 `字段：id INTEGER, name TEXT, score REAL`），`boost` 高于所有关键字（如 110）。
- **字段名**：`type: "property"`，`detail` 标注来源表和类型（如 `students 的字段 · TEXT`），`boost` 略低于表名、高于关键字（如 105）。
- **同名字段每表一条**，靠 detail 区分来源表。
- store 在补全回调内惰性读取（每次按键执行），题目切换后自动反映最新表结构。
- 非 SQL 语言、无题目上下文（如 admin/tutorial/learn 页面）或 `sql_display` 为空时，不追加任何项，行为与现状一致。

### 不做的事（YAGNI）

- 不改后端；不改题目描述展示（`SQLDataTable` 已展示表结构）。
- 管理端出题的 SQL 编辑器（`SQLTestcaseEditor`）不接入。
- 不做基于 SQL 语法位置的智能上下文补全（如 FROM 后只补表名）。

## 改动文件

| 文件 | 改动 |
|---|---|
| `src/shared/extensions/autocompletion.ts` | SQL 分支追加由 `sql_display.tables` 生成的动态补全项 |

（如生成逻辑较长，可拆一个小函数放同文件或 `sql.ts`，保持单一职责。）

## 错误处理

- `problem`、`sql_display`、`tables` 任一为空 → 返回纯静态列表（可选链兜底）。
- Pinia store 在组件上下文外调用的风险：补全回调在编辑器运行期触发，此时 Pinia 已安装；与 FlowchartEditor 的既有用法一致。

## 测试

项目无测试套件（政策：不写新测试）。人工验证：
1. 打开一道 SQL 题，编辑器中输入表名/字段名前缀，确认补全项出现且 detail/info 正确。
2. 打开非 SQL 题，确认补全行为无变化。
3. 协作编辑（SyncCodeEditor）场景同样生效。

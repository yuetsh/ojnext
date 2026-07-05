# SQL 题强制至少 2 个测试点 — 设计

日期：2026-07-05

## 背景

题目页的 `sql_display` 用**测试点 1** 的数据生成期望结果展示（截断到 20 行）。如果 SQL 题只有 1 个测试点且结果 ≤20 行，页面展示的期望结果就是完整答案输出，学生可用 `SELECT ... UNION ALL ...`（query 模式）或硬编码 INSERT/UPDATE（modify 模式）对照抄写直接 AC。多测试点时数据不同，硬编码只能过测试点 1。

## 决定

SQL 题**强制至少 2 个数据不同的初始化脚本**，前后端双重拦截：

- **前端** `ojnext/src/admin/problem/components/SQLTestcaseEditor.vue`：
  - `canUpload` 要求非空脚本数 ≥ 2，不满足时上传按钮禁用；
  - 上传按钮 tooltip 在脚本不足时显示原因（"SQL 题至少需要 2 个数据不同的测试点，防止硬编码期望结果"）。
- **后端** `OnlineJudge/problem/views/admin.py` 的 `TestCaseZipProcessor.process_zip`：
  - `sql=True` 且测试点数 < 2 时 `raise APIError(...)`，兜底直接调 API 的情况。

## 影响范围

- 只在**重新上传/保存测试点**时拦截，已有的单测试点老题目不受影响、不回溯校验。
- 非 SQL 题（.in/.out 沙箱判题）不受影响。
- "数据不同"不做内容级校验（两个脚本内容相同也能过），只保证数量下限，YAGNI。

## 验证

前端 `vue-tsc --noEmit`、Prettier 通过；后端 `ruff check` / `ruff format --check` 通过。
人工验证：出题页只填 1 个脚本 → 上传按钮禁用且 tooltip 说明原因；填 2 个并预览通过 → 可上传。

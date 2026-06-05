import type { AdminProblem } from "utils/types"

// 把后端的 AdminProblem 塑形成管理端列表项，与请求逻辑解耦。
export function toProblemListItem(result: AdminProblem) {
  return {
    id: result.id,
    _id: result._id,
    title: result.title,
    username: result.created_by.username,
    create_time: result.create_time,
    visible: result.visible,
    difficulty: result.difficulty,
    tags: result.tags,
    has_ast_rules: result.has_ast_rules,
    allow_flowchart: result.allow_flowchart,
    show_flowchart: result.show_flowchart,
  }
}

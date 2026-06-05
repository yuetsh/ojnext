import { DIFFICULTY } from "utils/constants"
import { getACRate } from "utils/functions"
import type { Problem } from "utils/types"

// 把后端的 Problem 塑形成列表项需要的形状，与请求逻辑解耦。
export function filterResult(result: Problem) {
  const newResult = {
    id: result.id,
    _id: result._id,
    title: result.title,
    difficulty: DIFFICULTY[result.difficulty],
    tags: result.tags,
    submission: result.submission_number,
    rate: getACRate(result.accepted_number, result.submission_number),
    status: "",
    author: result.created_by.username,
    allow_flowchart: result.allow_flowchart,
    show_flowchart: result.show_flowchart,
    has_ast_rules: result.has_ast_rules,
  }
  if (result.my_status === null || result.my_status === undefined) {
    newResult.status = "not_test"
  } else if (result.my_status === 0) {
    newResult.status = "passed"
  } else {
    newResult.status = "failed"
  }
  return newResult
}

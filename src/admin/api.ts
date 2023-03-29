import http from "utils/http"
import {
  BlankProblem,
  Problem,
  TestcaseUploadedReturns,
  User,
} from "~/utils/types"

export function getBaseInfo() {
  return http.get("admin/dashboard_info")
}

export async function getProblemList(
  offset = 0,
  limit = 10,
  keyword: string,
  contestID?: string
) {
  const endpoint = !!contestID ? "admin/contest/problem" : "admin/problem"
  const res = await http.get(endpoint, {
    params: { paging: true, offset, limit, keyword, contest_id: contestID },
  })
  return {
    results: res.data.results.map((result: Problem) => ({
      id: result.id,
      _id: result._id,
      title: result.title,
      username: result.created_by.username,
      create_time: result.create_time,
      visible: result.visible,
    })),
    total: res.data.total,
  }
}

export function deleteProblem(id: number) {
  return http.delete("admin/problem", { params: { id } })
}

export function deleteContestProblem(id: number) {
  return http.delete("admin/contest/problem", { params: { id } })
}

export function editProblem(problem: Problem | BlankProblem) {
  return http.put("admin/problem", problem)
}

export function editContestProblem(problem: Problem | BlankProblem) {
  return http.put("admin/contest/problem", problem)
}

export function getProblem(id: number) {
  return http.get("admin/problem", { params: { id } })
}

export function getContestProblem(id: number) {
  return http.get("admin/contest/problem", { params: { id } })
}

// 用户列表
export function getUserList(offset = 0, limit = 10, keyword: string) {
  return http.get("admin/user", {
    params: { paging: true, offset, limit, keyword },
  })
}

// 编辑用户
export function editUser(user: User) {
  return http.put("admin/user", user)
}

// 导入用户
export function importUsers(users: string[][]) {
  return http.post("admin/user", { users })
}

// 批量删除用户
export function deleteUsers(userIDs: number[]) {
  return http.delete("admin/user", { params: { id: userIDs.join(",") } })
}

export function getContestList(offset = 0, limit = 10, keyword: string) {
  return http.get("admin/contest", {
    params: { paging: true, offset, limit, keyword },
  })
}

// 上传图片
export async function uploadImage(file: File): Promise<string> {
  const form = new window.FormData()
  form.append("image", file)
  const res: { success: boolean; file_path: string; msg: "Success" } =
    await http.post("admin/upload_image", form, {
      headers: { "content-type": "multipart/form-data" },
    })
  return res.success ? res.file_path : ""
}

// 上传测试用例
export function uploadTestcases(file: File) {
  const form = new window.FormData()
  form.append("file", file)
  form.append("spj", "false")
  return http.post<TestcaseUploadedReturns>("admin/test_case", form, {
    headers: { "content-type": "multipart/form-data" },
  })
}

export function createProblem(problem: BlankProblem) {
  return http.post("admin/problem", problem)
}

export function createContestProblem(problem: BlankProblem) {
  return http.post("admin/contest/problem", problem)
}

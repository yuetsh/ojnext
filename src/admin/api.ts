import http from "utils/http"
import { Problem, User } from "~/utils/types"

export async function getProblemList(offset = 0, limit = 10, keyword: string) {
  const res = await http.get("admin/problem", {
    params: { paging: true, offset, limit, keyword },
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

export function editProblem(problem: Problem) {
  return http.put("admin/problem", problem)
}

export function getProblem(id: number) {
  return http.get("admin/problem", { params: { id } })
}

export function getUserList(offset = 0, limit = 10, keyword: string) {
  return http.get("admin/user", {
    params: { paging: true, offset, limit, keyword },
  })
}

export function deleteUsers(userIDs: number[]) {
  return http.delete("admin/user", { params: { id: userIDs.join(",") } })
}

export function editUser(user: User) {
  return http.put("admin/user", user)
}

export function getContestList(offset = 0, limit = 10, keyword: string) {
  return http.get("admin/contest", {
    params: { paging: true, offset, limit, keyword },
  })
}

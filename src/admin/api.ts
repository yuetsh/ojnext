import http from "utils/http"
import { Problem } from "~/utils/types"

export async function getProblemList(
  offset = 0,
  limit = 10,
  searchParams: any = {}
) {
  let params: any = {
    paging: true,
    offset,
    limit,
  }
  Object.keys(searchParams).forEach((element) => {
    if (searchParams[element]) {
      params[element] = searchParams[element]
    }
  })
  const res = await http.get("admin/problem", { params })
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

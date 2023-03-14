import http from "utils/http"
import { DIFFICULTY } from "~/utils/constants"
import { getACRate } from "~/utils/functions"
import { Problem } from "~/utils/types"

function filterResult(result: Problem) {
  const newResult = {
    id: result.id,
    _id: result._id,
    title: result.title,
    difficulty: DIFFICULTY[result.difficulty],
    tags: result.tags,
    submission: result.submission_number,
    rate: getACRate(result.accepted_number, result.submission_number),
    status: "",
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
    results: res.data.results.map(filterResult),
    total: res.data.total,
  }
}

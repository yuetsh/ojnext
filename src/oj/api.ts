import { getACRate } from "./../utils/functions"
import { DIFFICULTY } from "./../utils/constants"
import http from "./../utils/http"

function filterResult(result: any) {
  const newResult: any = {
    displayID: result._id,
    title: result.title,
    difficulty: DIFFICULTY[<"Low" | "Mid" | "High">result.difficulty],
    tags: result.tags,
    submission: result.submission_number,
    rate: getACRate(result.accepted_number, result.submission_number),
  }
  if (result.my_status === null || result.my_status === undefined) {
    newResult.status = "none"
  } else if (result.my_status === 0) {
    newResult.status = "done"
  } else {
    newResult.status = "tried"
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
  const res = await http.get("problem", {
    params,
  })
  return {
    results: res.data.results.map(filterResult),
    total: res.data.total,
  }
}

export function getProblemTagList() {
  return http.get("problem/tags")
}

export function getRandomProblemID() {
  return http.get("pickone")
}

export function getProblem(id: string) {
  return http.get("problem", {
    params: { problem_id: id },
  })
}

export function getWebsite() {
  return http.get("website")
}

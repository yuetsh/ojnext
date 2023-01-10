import { useAxios } from "@vueuse/integrations/useAxios"
import http from "./../utils/http"
import { getACRate } from "./../utils/functions"
import { DIFFICULTY } from "./../utils/constants"
import { Problem, SubmitCodePayload, Submission } from "./../utils/types"

function filterResult(result: Problem) {
  const newResult: any = {
    _id: result._id,
    title: result.title,
    difficulty: DIFFICULTY[result.difficulty],
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
  return useAxios<{ id: number; name: string }[]>("problem/tags", http)
}

export function getRandomProblemID() {
  return http.get("pickone")
}

export function getProblem(id: string) {
  return useAxios<Problem>("problem", { params: { problem_id: id } }, http)
}

export function getSubmission(id: string) {
  return http.get<Submission>("submission", {
    params: { id },
  })
}

export function submissionExists(problemID: number) {
  return http.get("submission_exists", {
    params: { problem_id: problemID },
  })
}

export function submitCode(data: SubmitCodePayload) {
  return http.post("submission", data)
}

import http from "utils/http"
import { getACRate } from "utils/functions"
import { DIFFICULTY } from "utils/constants"
import {
  Problem,
  SubmitCodePayload,
  Submission,
  SubmissionListPayload,
} from "utils/types"

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
  return http.get("problem", { params: { problem_id: id } })
}

export function getSubmission(id: string) {
  return http.get<Submission>("submission", {
    params: { id },
  })
}

export function submissionExists(problemID: number) {
  return http.get("submission_exists", { params: { problem_id: problemID } })
}

export function submitCode(data: SubmitCodePayload) {
  return http.post("submission", data)
}

export function getSubmissions(params: SubmissionListPayload) {
  return http.get("submissions", { params })
}

export function adminRejudge(id: string) {
  return http.get("admin/submission/rejudge", {
    params: { id },
  })
}

export function getRank(offset: number, limit: number) {
  return http.get("user_rank", {
    params: { offset, limit, rule: "acm" },
  })
}

export function getContestList(query: {
  offset: number
  limit: number
  keyword: string
  status: string
}) {
  return http.get("contests", { params: query })
}

export function getContest(id: string) {
  return http.get("contest", { params: { id } })
}

export function getContestAccess(id: string) {
  return http.get("contest/access", { params: { contest_id: id } })
}

export function checkContestPassword(contestID: string, password: string) {
  return http.post("contest/password", {
    contest_id: contestID,
    password,
  })
}

export async function getContestProblem(contestID: string) {
  const res = await http.get("contest/problem", {
    params: { contest_id: contestID },
  })
  return res.data.map(filterResult)
}

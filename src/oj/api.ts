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

export function getWebsiteConfig() {
  return http.get("website")
}

export async function getProblemList(
  offset = 0,
  limit = 10,
  searchParams: any = {},
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
  const res = await http.get("problem", { params })
  return {
    results: res.data.results.map(filterResult),
    total: res.data.total,
  }
}

export function getRandomProblemID() {
  return http.get("pickone")
}

export function getProblem(problemID: string, contestID: string) {
  const endpoint = !!contestID ? "contest/problem" : "problem"
  return http.get(endpoint, {
    params: {
      problem_id: problemID,
      contest_id: contestID,
    },
  })
}

export function getSubmission(id: string) {
  return http.get<Submission>("submission", {
    params: { id },
  })
}

export function submitCode(data: SubmitCodePayload) {
  return http.post("submission", data)
}

export function getSubmissions(params: SubmissionListPayload) {
  const endpoint = !!params.contest_id ? "contest_submissions" : "submissions"
  return http.get(endpoint, { params })
}

export function adminRejudge(id: string) {
  return http.get("admin/submission/rejudge", {
    params: { id },
  })
}

export function getSubmissionStatistics(
  duration: { start: string; end: string },
  problemID?: string,
  username?: string,
) {
  return http.get("admin/submission/statistics", {
    params: {
      ...duration,
      problem_id: problemID,
      username,
    },
  })
}

export function getRank(
  offset: number,
  limit: number,
  n: number,
  username?: string,
) {
  return http.get("user_rank", {
    params: { offset, limit, rule: "acm", username, n },
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

export async function getContestProblems(contestID: string) {
  const res = await http.get("contest/problem", {
    params: { contest_id: contestID },
  })
  return res.data.map(filterResult)
}

export function getContestRank(
  contestID: string,
  query: { limit: number; offset: number; force_refresh: "1" | "0" },
) {
  return http.get("contest_rank", {
    params: {
      contest_id: contestID,
      ...query,
    },
  })
}

export function uploadAvatar(file: File) {
  const form = new window.FormData()
  form.append("image", file)
  return http.post("upload_avatar", form, {
    headers: { "content-type": "multipart/form-data" },
  })
}

export function updateProfile(data: { real_name: string; mood: string }) {
  return http.put("profile", data)
}

export function getAnnouncementList(offset = 10, limit = 10) {
  return http.get("announcement", { params: { limit, offset } })
}

export function getAnnouncement(id: number) {
  return http.get("announcement", { params: { id } })
}

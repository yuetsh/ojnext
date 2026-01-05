import http from "utils/http"
import {
  AdminProblem,
  Announcement,
  AnnouncementEdit,
  BlankContest,
  BlankProblem,
  Contest,
  Server,
  TestcaseUploadedReturns,
  Tutorial,
  User,
  WebsiteConfig,
} from "utils/types"

export function getBaseInfo() {
  return http.get("admin/dashboard_info")
}

export function randomUser10(classroom: string) {
  return http.get("admin/random_user", { params: { classroom } })
}

export async function getProblemList(
  offset = 0,
  limit = 10,
  keyword: string,
  author?: string,
  contestID?: string,
) {
  const endpoint = !!contestID ? "admin/contest/problem" : "admin/problem"
  const res = await http.get(endpoint, {
    params: {
      paging: true,
      offset,
      limit,
      keyword,
      author,
      contest_id: contestID,
    },
  })
  return {
    results: res.data.results.map((result: AdminProblem) => ({
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

export function editProblem(problem: AdminProblem | BlankProblem) {
  return http.put("admin/problem", problem)
}

export function toggleProblemVisible(problemID: number) {
  return http.put("admin/problem/visible", { id: problemID })
}

export function generateFlowchartFromPythonCode(python: string) {
  return http.post("admin/problem/flowchart", { python })
}

export function editContestProblem(problem: AdminProblem | BlankProblem) {
  return http.put("admin/contest/problem", problem)
}

export function getProblem(id: string | number) {
  return http.get<AdminProblem>("admin/problem", { params: { id } })
}

export function getContestProblem(id: number) {
  return http.get("admin/contest/problem", { params: { id } })
}

// 用户列表
export function getUserList(
  offset = 0,
  limit = 10,
  type = "",
  keyword: string,
  orderBy = "",
) {
  return http.get("admin/user", {
    params: { paging: true, offset, limit, keyword, type, order_by: orderBy },
  })
}

// 编辑用户
export function editUser(user: User) {
  return http.put("admin/user", user)
}

// 重置用户密码
export function resetPassword(userID: number) {
  return http.post("admin/reset_password", { id: userID })
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

export function createContest(contest: BlankContest) {
  return http.post("admin/contest", contest)
}

export function editContest(contest: Contest | BlankContest) {
  return http.put("admin/contest", contest)
}

export function getContest(id: string) {
  return http.get<Contest & { password: string }>("admin/contest", {
    params: { id },
  })
}

export function addProblemForContest(
  contestID: string,
  problemID: number,
  displayID: string,
) {
  return http.post("admin/contest/add_problem_from_public", {
    contest_id: contestID,
    problem_id: problemID,
    display_id: displayID,
  })
}

export function getWebsite() {
  return http.get<WebsiteConfig>("admin/website")
}

export function editWebsite(data: WebsiteConfig) {
  return http.post("admin/website", data)
}

export function listInvalidTestcases() {
  return http.get("admin/prune_test_case")
}

export function pruneInvalidTestcases(id?: string) {
  return http.delete("admin/prune_test_case", { params: { id } })
}

export function getJudgeServer() {
  return http.get<{ token: string; servers: Server[] }>("admin/judge_server")
}

export function deleteJudgeServer(hostname: string) {
  return http.delete("admin/judge_server", { params: { hostname } })
}

export function getAnnouncementList(offset = 0, limit = 10) {
  return http.get("admin/announcement", {
    params: { paging: true, offset, limit },
  })
}

export function getAnnouncement(id: number) {
  return http.get<Announcement>("admin/announcement", { params: { id } })
}

export function deleteAnnouncement(id: number) {
  return http.delete("admin/announcement", { params: { id } })
}

export function editAnnouncement(announcement: AnnouncementEdit) {
  return http.put("admin/announcement", announcement)
}

export function createAnnouncement(announcement: AnnouncementEdit) {
  return http.post("admin/announcement", announcement)
}

export function getCommentList(offset = 0, limit = 10, problem: string) {
  return http.get("admin/comment", {
    params: { offset, limit, problem },
  })
}

export function deleteComment(id: number) {
  return http.delete("admin/comment", { params: { id } })
}

export async function getTutorialList() {
  const res = await http.get("admin/tutorial")
  return res.data
}

export async function getTutorial(id: number) {
  const res = await http.get("admin/tutorial", { params: { id } })
  return res.data
}

export async function createTutorial(data: Partial<Tutorial>) {
  const res = await http.post("admin/tutorial", data)
  return res.data
}

export async function updateTutorial(data: Partial<Tutorial>) {
  const res = await http.put("admin/tutorial", data)
  return res.data
}

export function deleteTutorial(id: number) {
  return http.delete("admin/tutorial", { params: { id } })
}

export function setTutorialVisibility(id: number, is_public: boolean) {
  return http.put("admin/tutorial/visibility", { id, is_public })
}

// 将竞赛题目转为公开题目
export function makeProblemPublic(id: number, display_id: string) {
  return http.post("admin/contest_problem/make_public", {
    id,
    display_id,
  })
}

// 比赛辅助检查
export function getACMHelperList(contest_id: number) {
  return http.get("admin/contest/acm_helper", {
    params: { contest_id },
  })
}

export function updateACMHelperChecked(
  contest_id: number,
  rank_id: number,
  problem_id: string,
  checked: boolean,
) {
  return http.put("admin/contest/acm_helper", {
    contest_id,
    rank_id,
    problem_id,
    checked,
  })
}

// 题单管理 API
export function getProblemSetList(
  offset = 0,
  limit = 10,
  keyword = "",
  difficulty = "",
  status = "",
) {
  return http.get("admin/problemset", {
    params: {
      offset,
      limit,
      keyword,
      difficulty,
      status,
    },
  })
}

export function getProblemSetDetail(id: number) {
  return http.get(`admin/problemset/${id}`)
}

export function createProblemSet(data: {
  title: string
  description: string
  difficulty: string
  status: string
}) {
  return http.post("admin/problemset", data)
}

export function editProblemSet(data: {
  id: number
  title?: string
  description?: string
  difficulty?: string
  status?: string
  visible?: boolean
}) {
  return http.put("admin/problemset", data)
}

export function deleteProblemSet(id: number) {
  return http.delete("admin/problemset", { params: { id } })
}

export function toggleProblemSetVisible(id: number) {
  return http.put("admin/problemset/visible", { id })
}

export function updateProblemSetStatus(id: number, status: string) {
  return http.put("admin/problemset/status", { id, status })
}

// 题单题目管理 API
export function getProblemSetProblems(problemSetId: number) {
  return http.get(`admin/problemset/${problemSetId}/problems`)
}

export function addProblemToSet(
  problemSetId: number,
  data: {
    problem_id: string
    order?: number
    is_required?: boolean
    score?: number
    hint?: string
  },
) {
  return http.post(`admin/problemset/${problemSetId}/problems`, data)
}

export function editProblemInSet(
  problemSetId: number,
  problemSetProblemId: number,
  data: {
    order?: number
    is_required?: boolean
    score?: number
    hint?: string
  },
) {
  return http.put(
    `admin/problemset/${problemSetId}/problems/${problemSetProblemId}`,
    data,
  )
}

export function removeProblemFromSet(
  problemSetId: number,
  problemSetProblemId: number,
) {
  return http.delete(
    `admin/problemset/${problemSetId}/problems/${problemSetProblemId}`,
  )
}

// 题单奖章管理 API
export function getProblemSetBadges(problemSetId: number) {
  return http.get(`admin/problemset/${problemSetId}/badges`)
}

export function createProblemSetBadge(
  problemSetId: number,
  data: {
    name: string
    description: string
    icon: string
    condition_type: string
    condition_value: number
    level?: number
  },
) {
  return http.post(`admin/problemset/${problemSetId}/badges`, data)
}

export function editProblemSetBadge(
  problemSetId: number,
  badgeId: number,
  data: {
    name?: string
    description?: string
    icon?: string
    condition_type?: string
    condition_value?: number
    level?: number
  },
) {
  return http.put(`admin/problemset/${problemSetId}/badges/${badgeId}`, data)
}

export function deleteProblemSetBadge(problemSetId: number, badgeId: number) {
  return http.delete(`admin/problemset/${problemSetId}/badges/${badgeId}`)
}

// 题单进度管理 API
export function getProblemSetProgress(problemSetId: number) {
  return http.get(`admin/problemset/${problemSetId}/progress`)
}

export function removeUserFromProblemSet(problemSetId: number, userId: number) {
  return http.delete(`admin/problemset/${problemSetId}/progress/${userId}`)
}

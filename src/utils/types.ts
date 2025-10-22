import { ContestStatus, ContestType, LANGUAGE_SHOW_VALUE } from "./constants"

export interface Profile {
  id: number
  user: User
  real_name: string
  acm_problems_status: {
    problems: {
      [key: string]: {
        _id: string
        status: number
      }
    }
  }
  oi_problems_status: {
    problems: {
      [key: string]: {
        _id: string
        score: number
        status: number
      }
    }
  }
  avatar: string
  blog: null
  mood: string
  github: string
  school: string
  major: string
  language: string
  accepted_number: number
  total_score: number
  submission_number: number
}

export type UserAdminType = "Regular User" | "Admin" | "Super Admin"

export interface User {
  id: number
  username: string
  real_name: string
  email: string
  admin_type: UserAdminType
  problem_permission: string
  create_time: Date
  last_login: Date
  two_factor_auth: boolean
  open_api: boolean
  is_disabled: boolean
  password?: string
  raw_password?: string
}

export type LANGUAGE =
  | "C"
  | "C++"
  | "Python2"
  | "Python3"
  | "Java"
  | "JavaScript"
  | "Golang"
  | "Flowchart"

export type LANGUAGE_SHOW_LABEL =
  (typeof LANGUAGE_SHOW_VALUE)[keyof typeof LANGUAGE_SHOW_VALUE]

export type SUBMISSION_RESULT = -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type ProblemStatus = "passed" | "failed" | "not_test"

interface SampleUser {
  id: number
  username: string
  real_name: string | null
}

export interface Tag {
  id: number
  name: string
}

export interface TestcaseUploadedReturns {
  id: string
  info: Testcase[]
}

export interface Testcase {
  input_name: string
  output_name: string
  score: string
}

export interface Problem {
  _id: string
  id: number
  tags: string[]
  created_by: SampleUser
  template: { [key in LANGUAGE]?: string }
  title: string
  description: string
  input_description: string
  output_description: string
  samples: {
    input: string
    output: string
  }[]
  hint: string
  languages: Array<LANGUAGE>
  create_time: Date
  last_update_time: null
  time_limit: number
  memory_limit: number
  io_mode: {
    input: string
    output: string
    io_mode: string
  }
  rule_type: string
  difficulty: "Low" | "Mid" | "High"
  source: string
  prompt: string
  answers: { language: LANGUAGE; code: string }[]
  total_score: number
  submission_number: number
  accepted_number: number
  statistic_info: { [key: string]: number }
  share_submission: boolean
  contest: number
  my_status: number
  visible: boolean

  // 流程图相关字段
  allow_flowchart: boolean
  mermaid_code?: string
  flowchart_data?: Record<string, any>
  flowchart_hint?: string
  show_flowchart?: boolean
}

export type AdminProblem = Problem & AlterProblem

interface AlterProblem {
  test_case_id: string
  test_case_score: Testcase[]
  contest_id?: string
}

type ExcludeKeys =
  | "id"
  | "created_by"
  | "create_time"
  | "last_update_time"
  | "my_status"
  | "contest"
  | "statistic_info"
  | "accepted_number"
  | "submission_number"
  | "total_score"

export type BlankProblem = Omit<Problem, ExcludeKeys> &
  AlterProblem & { id?: number }

export interface ProblemFiltered {
  _id: string
  id: number
  title: string
  difficulty: "简单" | "中等" | "困难"
  tags: string[]
  submission: number
  rate: string
  status: "not_test" | "passed" | "failed"
  author: string
  allow_flowchart: boolean
}

export interface AdminProblemFiltered {
  _id: string
  id: number
  title: string
  visible: boolean
  username: string
  create_time: string
}

// 题单相关类型
export interface ProblemSet {
  id: number
  title: string
  description: string
  created_by: SampleUser
  create_time: Date
  difficulty: "Easy" | "Medium" | "Hard"
  status: "active" | "archived" | "draft"
  visible: boolean
  problems_count: number
  completed_count: number
}

export interface ProblemSetList {
  id: number
  title: string
  description: string
  created_by: SampleUser
  create_time: Date
  difficulty: "Easy" | "Medium" | "Hard"
  status: "active" | "archived" | "draft"
  problems_count: number
  visible: boolean
  user_progress: {
    is_joined: boolean
    progress_percentage: number
    completed_count: number
    total_count: number
    is_completed: boolean
  }
}

export interface ProblemSetProblem {
  id: number
  problemset: number
  problem: Problem
  order: number
  is_required: boolean
  score: number
  hint: string
}

export interface ProblemSetBadge {
  id: number
  problemset: number
  name: string
  description: string
  icon: string
  condition_type: "all_problems" | "problem_count" | "score"
  condition_value: number
}

export interface ProblemSetProgress {
  id: number
  problemset: ProblemSetList
  user: SampleUser
  join_time: Date
  completed_problems_count: number
  total_problems_count: number
  progress_percentage: number
  is_completed: boolean
}

export interface CreateProblemSetData {
  title: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  status: "active" | "archived" | "draft"
}

export interface EditProblemSetData {
  id: number
  title?: string
  description?: string
  difficulty?: "Easy" | "Medium" | "Hard"
  status?: "active" | "archived" | "draft"
  visible?: boolean
}

export interface Code {
  language: LANGUAGE
  value: string
}

export interface SubmitCodePayload {
  problem_id: number
  language: LANGUAGE
  code: string
  contest_id?: number
}

// ==================== 流程图相关类型 ====================

export const FlowchartSubmissionStatus = {
  PENDING: 0, // 等待AI评分
  PROCESSING: 1, // AI评分中
  COMPLETED: 2, // 评分完成
  FAILED: 3, // 评分失败
} as const

export interface FlowchartSubmission {
  id: string
  user: number
  problem: number
  mermaid_code: string
  flowchart_data: Record<string, any>
  status: number
  create_time: string
  ai_score?: number
  ai_grade?: string
  ai_feedback?: string
  ai_suggestions?: string
  ai_criteria_details: Record<string, any>
  ai_provider?: string
  ai_model?: string
  processing_time?: number
  evaluation_time?: string
}

// 列表接口返回的字段（包含 username 和 problem_title）
export interface FlowchartSubmissionListItem {
  id: string
  create_time: string
  evaluation_time: string
  ai_score: number
  ai_grade: Grade
  ai_model: string
  ai_provider: string
  processing_time: number
  status: number
  username: string
  problem_title: string
  problem: string
  show_link: boolean
}
export interface SubmitFlowchartPayload {
  problem_id: number
  mermaid_code: string
  flowchart_data?: Record<string, any>
}

interface Info {
  err: string | null
  data: {
    error: number
    memory: number
    output: null
    result: SUBMISSION_RESULT
    signal: number
    cpu_time: number
    exit_code: number
    real_time: number
    test_case: string
    output_md5: string
  }[]
}

export interface Submission {
  id: string
  create_time: Date
  user_id: number
  username: string
  code: string
  result: SUBMISSION_RESULT
  info: Info
  language: LANGUAGE
  shared: boolean
  show_link: boolean
  statistic_info: {
    score?: number
    err_info?: string
    time_cost?: number
    memory_cost?: number
  }
  ip: string
  contest: number
  problem: number // 不是 display_id
  can_unshare: boolean
}

export interface SubmissionListItem {
  id: string
  problem: string
  problem_title: string
  show_link: boolean
  create_time: string
  user_id: number
  username: string
  result: SUBMISSION_RESULT
  language: LANGUAGE
  shared: boolean
  statistic_info: {
    time_cost: number
    memory_cost: number
  }
}

export interface SubmissionListPayload {
  myself?: "1" | "0"
  result?: string
  username?: string
  contest_id?: string
  problem_id?: string
  language: LANGUAGE | ""
  page: number
  limit: number
  offset: number
}

export interface Rank {
  id: number
  user: SampleUser
  acm_problems_status: {
    problems: {
      [key: string]: {
        _id: string
        status: number
      }
    }
    contest_problems?: {
      [key: string]: {
        [key: string]: {
          _id: string
          status: number
        }
      }
    }
  }
  oi_problems_status: {}
  real_name: null | string
  avatar: string
  blog: null
  mood: null | string
  github: null
  school: null | string
  major: null | string
  language: null | string
  accepted_number: number
  total_score: number
  submission_number: number
}

export interface Contest extends BlankContest {
  id: number
  created_by: SampleUser
  status: ContestStatus
  contest_type: ContestType
  create_time: string
  now: string
  last_update_time: string
}

export interface BlankContest {
  title: string
  description: string
  tag: string
  start_time: string
  end_time: string
  rule_type: "ACM" | "OI"
  password: string
  real_time_rank: boolean
  visible: boolean
  allowed_ip_ranges: { value: string }[]
}

interface SubmissionInfo {
  is_ac: boolean
  ac_time: number
  is_first_ac: boolean
  error_number: number
  checked?: boolean
}

export interface ContestRank {
  id: number
  user: SampleUser
  submission_number: number
  accepted_number: number
  total_time: number
  submission_info: { [key: string]: SubmissionInfo }
  contest: number
}

export interface WebsiteConfig {
  website_base_url: string
  website_name: string
  website_name_shortcut: string
  website_footer: string
  allow_register: boolean
  submission_list_show_all: boolean
  class_list: string[] & never[]
  enable_maxkb: boolean
}

export interface Server {
  id: number
  status: "abnormal" | "normal"
  hostname: string
  ip: string
  judger_version: string
  cpu_core: number
  memory_usage: number
  cpu_usage: number
  last_heartbeat: Date
  create_time: Date
  task_number: number
  service_url: string
  is_disabled: boolean
}

export interface AnnouncementEdit {
  id: number
  title: string
  tag: string
  content: string
  visible: boolean
  top: boolean
}

export interface Announcement extends AnnouncementEdit {
  created_by: SampleUser
  create_time: Date
  last_update_time: Date
}

export interface Message {
  sender: User
  create_time: Date
  message: string
  submission: Submission
}

export interface CreateMessage {
  sender: string
  recipient: string
  submission: string
  message: string
}

export interface Comment {
  id: number
  problem: string
  submission: string
  content: string
  description_rating: 1 | 2 | 3 | 4 | 5
  difficulty_rating: 1 | 2 | 3 | 4 | 5
  comprehensive_rating: 1 | 2 | 3 | 4 | 5
  create_time: Date
  user: SampleUser
}

export interface Tutorial {
  id: number
  title: string
  content: string
  code: string
  is_public: boolean
  order: number
  type: "python" | "c"
  created_by?: User
  updated_at?: Date
  created_at?: Date
}

export interface DurationData {
  unit: string
  index: number
  start: string
  end: string
  grade: Grade
  problem_count: number
  submission_count: number
}

export interface SolvedProblem {
  problem: {
    title: string
    display_id: string
    contest_title: string
    contest_id: number
  }
  ac_time: string
  rank: number
  ac_count: number
  grade: Grade
  difficulty: string
}

export interface FlowchartSummary {
  problem__id: string
  problem_title: string
  submission_count: number
  best_score: number
  best_grade: string
  latest_submission_time: string
  avg_score: number
}

export interface DetailsData {
  start: string
  end: string
  grade: Grade
  class_name: string
  tags: { [key: string]: number }
  difficulty: { [key: string]: number }
  contest_count: number
  solved: SolvedProblem[]
  flowcharts: FlowchartSummary[]
}

export type Grade = "S" | "A" | "B" | "C"
